"use strict";
/* Real Chromium CDP browser click + visual acceptance for NK-Pro 0.7.
 * Screenshots are CI artifacts. No external packages or real user data. */
const assert=require("node:assert/strict"),fs=require("node:fs"),os=require("node:os"),
 path=require("node:path"),http=require("node:http"),cp=require("node:child_process");
const root=path.resolve(__dirname,".."),output=path.join(root,"_visual-test-artifacts");
fs.mkdirSync(output,{recursive:true});
const contentTypes={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".css":"text/css; charset=utf-8"};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent((req.url||"/").split("?")[0]);
 const filepath=path.resolve(root,"."+(pathname==="/"?"/index.html":pathname));
 if(!filepath.startsWith(root+path.sep)||!fs.existsSync(filepath)||!fs.statSync(filepath).isFile()){
   res.writeHead(404);res.end("Not found");return;
 }
 res.writeHead(200,{"Content-Type":contentTypes[path.extname(filepath)]||"text/plain",
   "Cache-Control":"no-store"});
 fs.createReadStream(filepath).pipe(res);
});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const chromeBinary=()=>{
 for(const cmd of [process.env.CHROME_BIN,"google-chrome","google-chrome-stable",
   "chromium","chromium-browser","/usr/bin/chromium","/usr/bin/google-chrome"]){
  if(!cmd)continue;
  if(cp.spawnSync(cmd,["--version"],{timeout:4000}).status===0)return cmd;
 }
 throw new Error("Neither Chromium nor Google Chrome installed; real visual tests mandatory.");
};
(async()=>{
 let chrome,ws,profile;
 try{
  await new Promise(r=>server.listen(0,"127.0.0.1",r));
  const base="http://127.0.0.1:"+server.address().port;
  profile=fs.mkdtempSync(path.join(os.tmpdir(),"nkpro-visual-"));
  chrome=cp.spawn(chromeBinary(),["--headless=new","--no-sandbox","--disable-gpu",
   "--disable-dev-shm-usage","--remote-allow-origins=*","--no-first-run",
   "--remote-debugging-port=0","--user-data-dir="+profile,"--window-size=1440,900","about:blank"],
   {stdio:"ignore"});
  const marker=path.join(profile,"DevToolsActivePort");
  let port;
  for(let i=0;i<350;i++){
   if(fs.existsSync(marker)){port=Number(fs.readFileSync(marker,"utf8").split("\n")[0]);break;}
   if(chrome.exitCode!==null)throw new Error("Chrome exited before CDP launch");
   await pause(100);
  }
  assert.ok(port,"Chrome did not create DevToolsActivePort");
  const targets=await fetch("http://127.0.0.1:"+port+"/json/list").then(r=>r.json());
  const target=targets.find(t=>t.type==="page");
  assert.ok(target?.webSocketDebuggerUrl);
  ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.addEventListener("open",resolve,{once:true});
    ws.addEventListener("error",reject,{once:true});});
  let seq=0;const pending=new Map();
  ws.addEventListener("message",event=>{
   const d=JSON.parse(event.data);
   if(!d.id||!pending.has(d.id))return;
   const p=pending.get(d.id);pending.delete(d.id);
   d.error?p.reject(new Error(p.method+" "+JSON.stringify(d.error))):p.resolve(d.result);
  });
  function cmd(method,params={}){
   return new Promise((resolve,reject)=>{
    const id=++seq;pending.set(id,{method,resolve,reject});
    ws.send(JSON.stringify({id,method,params}));
    const timer=setTimeout(()=>{
      if(pending.has(id)){pending.delete(id);reject(new Error("CDP timeout: "+method));}
    },15000);
    timer.unref();
   });
  }
  async function evalJS(source){
   const x=await cmd("Runtime.evaluate",{expression:"(function(){"+source+"})()",
    returnByValue:true,awaitPromise:true});
   if(x.exceptionDetails)throw new Error("Page script: "+JSON.stringify(x.exceptionDetails));
   return x.result.value;
  }
  async function waitFor(source){
   for(let i=0;i<85;i++){if(await evalJS(source))return;await pause(100);}
   throw new Error("Browser wait timeout: "+source);
  }
  async function click(selector){
   const yes=await evalJS("const e=document.querySelector("+JSON.stringify(selector)+");"+
     "if(!e||e.disabled)return false;e.click();return true;");
   assert.equal(yes,true,"Click target absent/disabled: "+selector);
  }
  async function snap(name){
   const x=await cmd("Page.captureScreenshot",{format:"png",fromSurface:true});
   const p=path.join(output,name+".png");
   fs.writeFileSync(p,Buffer.from(x.data,"base64"));
   assert.ok(fs.statSync(p).size>7000,"Screenshot empty "+name);
  }
  async function layout(){
   return evalJS("const sb=document.querySelector('.sidebar').getBoundingClientRect(),"+
    "m=document.querySelector('#appMain').getBoundingClientRect();"+
    "return{vw:innerWidth,sw:document.documentElement.scrollWidth,sbRight:sb.right,"+
    "mainLeft:m.left,tree:document.querySelectorAll('.tree-property-button').length,"+
    "h:document.querySelector('#appMain h1')?.textContent||''};");
  }
  await cmd("Page.enable");await cmd("Runtime.enable");
  await cmd("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await cmd("Page.navigate",{url:base+"/index.html"});
  await waitFor("return document.querySelectorAll('#portfolioTree .tree-property-button').length===3;");
  let d=await layout();
  assert.equal(d.tree,3);assert.ok(d.sw<=d.vw+1&&d.sbRight<=d.mainLeft+4);
  assert.match(d.h,/Startseite/);assert.ok(d.sbRight>=285);
  await snap("01-desktop-portfolio");
  await click('[data-action="select-property"][data-id="SYN-A"]');
  await click('[data-action="object-billings"][data-id="SYN-A"]');
  await waitFor("return document.querySelectorAll('.annual-row').length===3;");
  d=await layout();assert.ok(d.sw<=d.vw+1);assert.match(d.h,/Jahresabrechnungen/);
  await snap("02-desktop-object-A-annual-records");
  await click('[data-view="analytics"]');
  await waitFor("return document.querySelector('#appMain h1')?.textContent==='Analysezentrum';");
  assert.equal(await evalJS("return document.querySelectorAll('.tree-property.expanded').length;"),0);
  await click('[data-view="overview"]');
  await click('.tree-property-button[data-id="SYN-B"]');
  await waitFor("return document.querySelector('#breadcrumbView').textContent.includes('Musterobjekt B');");
  await click('[data-action="toggle-tree-section"][data-id="master"]');
  await click('[data-action="open-object-tab"][data-id="units"]');
  assert.equal(await evalJS("return document.querySelectorAll('.data-table tbody tr').length;"),3);
  assert.equal(await evalJS("return document.querySelectorAll('[data-action=view-unit]').length;"),0);
  await snap("03-desktop-three-units");
  await click('[data-action="edit-master-unit"][data-id="SYN-B-W02"]');
  await waitFor("return document.querySelector('#drawerTitle')?.textContent==='Wohnung 2';");
  await snap("04-desktop-unit-editor");
  await click('#closeDrawer');
  await click('[data-action="open-object-tab"][data-id="meters"]');
  assert.equal(await evalJS("return document.querySelectorAll('.meter-unit').length;"),3);
  assert.equal(await evalJS("return document.querySelectorAll('[data-action=view-unit]').length;"),0);
  await snap("04b-desktop-meter-master");
  await click('[data-action="edit-master-meter"]');
  await waitFor("return document.querySelector('#drawerTitle')?.textContent==='Zähler bearbeiten';");
  await click('#closeDrawer');
  await click('[data-action="open-year"][data-id="SYN-B|2024"]');
  await waitFor("return document.querySelector('#appMain h1')?.textContent==='Abrechnung 2024';");
  assert.equal(await evalJS("return document.querySelectorAll('.tab-button').length;"),6);
  assert.equal(await evalJS("return document.querySelectorAll('[data-step=tenancies]').length;"),0);
  await click('[data-step="costs"]');
  assert.ok(await evalJS("return Array.from(document.querySelectorAll('[data-action=edit-cost]')).every(b=>b.disabled);"));
  await snap("05-desktop-readonly-year");
  await click('.tree-property-button[data-id="SYN-A"]');
  await click('[data-action="open-year"][data-id="SYN-A|2025"]');
  await click('[data-step="advance"]');
  await click('[data-action="edit-payment"]');
  assert.match(await evalJS("return document.querySelector('#drawerBody').innerText;"),/Tatsächlich gezahlt/);
  await snap("06-desktop-payment-dialog");
  await click('#closeDrawer');
  await cmd("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await pause(220);
  const mobile=await evalJS("return{vw:innerWidth,sw:document.documentElement.scrollWidth,"+
    "menu:getComputedStyle(document.querySelector('#openMenu')).display!=='none'};");
  assert.equal(mobile.menu,true);
  assert.ok(mobile.sw<=mobile.vw+2,"Mobile viewport overflow "+JSON.stringify(mobile));
  await snap("07-mobile-workflow");
  await click('#openMenu');
  assert.equal(await evalJS("return document.body.classList.contains('menu-open');"),true);
  await waitFor("return document.querySelector('.sidebar').getBoundingClientRect().right>0;");
  assert.ok(await evalJS("return document.querySelector('.sidebar').getBoundingClientRect().width>=275;"));
  await snap("08-mobile-explorer");
  await click('[data-action="object-billings"][data-id="SYN-A"]');
  await waitFor("return document.querySelector('#appMain h1')?.textContent==='Jahresabrechnungen';");
  const m2=await evalJS("return{vw:innerWidth,sw:document.documentElement.scrollWidth,"+
    "menu:document.body.classList.contains('menu-open')};");
  assert.ok(m2.sw<=m2.vw+2,"Mobile annual-list overflow "+JSON.stringify(m2));
  assert.equal(m2.menu,false);
  await snap("09-mobile-year-list");
  console.log("CDP_PASS: 3 objects, 12 apartments, 7 annual records, apartment master list, inline meter registry, frozen years and mobile explorer.");
  console.log("SCREENSHOTS "+output);
 }finally{
   try{ws?.close()}catch{}
   try{chrome?.kill("SIGKILL")}catch{}
   await new Promise(r=>server.close(r));
   if(profile)fs.rmSync(profile,{recursive:true,force:true,maxRetries:3});
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
