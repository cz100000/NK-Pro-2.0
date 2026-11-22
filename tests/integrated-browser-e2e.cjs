"use strict";
/* Full real-click Chromium acceptance of integrated Systemstatus import, navigation,
   offline reload and encrypted real-data storage. ONLY synthetic JSON fixture. */
const assert=require("node:assert/strict"),fs=require("node:fs"),os=require("node:os"),
 path=require("node:path"),http=require("node:http"),cp=require("node:child_process");
const {source}=require("./integrated-real-master.test.cjs");
const root=path.resolve(__dirname,".."),artifacts=path.join(root,"_visual-test-artifacts");
fs.mkdirSync(artifacts,{recursive:true});
const server=http.createServer((req,res)=>{
 const u=decodeURIComponent((req.url||"/").split("?")[0]);
 const target=path.resolve(root,"."+(u==="/"?"/index.html":u));
 if(!target.startsWith(root+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile()){
  res.writeHead(404);res.end("Not found");return;
 }
 const ct={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8",".webmanifest":"application/manifest+json"};
 res.writeHead(200,{"content-type":ct[path.extname(target)]||"text/plain","Cache-Control":"no-store"});
 fs.createReadStream(target).pipe(res);
});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const chromeBinary=()=>{
 for(const cmd of [process.env.CHROME_BIN,"google-chrome","google-chrome-stable",
   "chromium","chromium-browser","/usr/bin/chromium","/usr/bin/google-chrome"]){
  if(cmd&&cp.spawnSync(cmd,["--version"],{timeout:4000}).status===0)return cmd;
 }
 throw Error("Chromium required");
};
(async()=>{
 let chrome,ws,profile;
 try{
  await new Promise(r=>server.listen(0,"127.0.0.1",r));
  const base="http://127.0.0.1:"+server.address().port;
  profile=fs.mkdtempSync(path.join(os.tmpdir(),"nkpro-integrated-"));
  chrome=cp.spawn(chromeBinary(),["--headless=new","--no-sandbox","--disable-gpu",
   "--disable-dev-shm-usage","--remote-allow-origins=*","--no-first-run",
   "--remote-debugging-port=0","--user-data-dir="+profile,"about:blank"],{stdio:"ignore"});
  const marker=path.join(profile,"DevToolsActivePort");let port=0;
  for(let i=0;i<250;i++){
   if(fs.existsSync(marker)){port=Number(fs.readFileSync(marker,"utf8").split("\n")[0]);break;}
   if(chrome.exitCode!==null)throw Error("Chromium exited");
   await pause(100);
  }
  assert.ok(port,"No Chrome debugger port");
  const tabs=await fetch("http://127.0.0.1:"+port+"/json/list").then(r=>r.json());
  ws=new WebSocket(tabs.find(t=>t.type==="page").webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{
   ws.addEventListener("open",resolve,{once:true});ws.addEventListener("error",reject,{once:true});
  });
  let seq=0;const pending=new Map();
  ws.addEventListener("message",ev=>{
   const d=JSON.parse(ev.data);if(!d.id||!pending.has(d.id))return;
   const p=pending.get(d.id);pending.delete(d.id);
   d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);
  });
  const cmd=(method,params={})=>new Promise((resolve,reject)=>{
   const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));
   setTimeout(()=>{if(pending.has(id)){pending.delete(id);reject(Error("CDP_TIMEOUT_"+method));}},12000).unref();
  });
  async function evalJS(sourceCode){
   const r=await cmd("Runtime.evaluate",{expression:"(function(){"+sourceCode+"})()",
    returnByValue:true,awaitPromise:true});
   if(r.exceptionDetails)throw Error("Browser exception: "+JSON.stringify(r.exceptionDetails));
   return r.result.value;
  }
  async function until(expression){
   for(let i=0;i<100;i++){if(await evalJS(expression))return;await pause(100);}
   throw Error("Timeout waiting for "+expression);
  }
  async function shot(name){
   const r=await cmd("Page.captureScreenshot",{format:"png",fromSurface:true});
   const file=path.join(artifacts,name+".png");
   fs.writeFileSync(file,Buffer.from(r.data,"base64"));
   assert.ok(fs.statSync(file).size>7000,"Empty screenshot");
  }
  await cmd("Page.enable");await cmd("Runtime.enable");
  await cmd("Emulation.setDeviceMetricsOverride",{width:1400,height:850,deviceScaleFactor:1,mobile:false});
  await cmd("Page.navigate",{url:base+"/index.html"});
  await until("return !!document.querySelector('#nkSyncButton') && !!window.NKPRO2_INTEGRATED_APP;");
  assert.equal(await evalJS("return document.querySelector('#nkSyncPanel').hidden;"),true);
  await evalJS("document.querySelector('#nkSyncButton').click();");
  assert.equal(await evalJS("return document.querySelector('#nkSyncPanel').hidden;"),false);
  await shot("integrated-01-systemstatus-cloud");
  const json=JSON.stringify(source());
  const code="const dt=new DataTransfer();dt.items.add(new File(["+
   JSON.stringify(json)+"],'synthetic-source.json',{type:'application/json'}));"+
   "document.querySelector('#nkSource').files=dt.files;"+
   "document.querySelector('#nkSyncPassword').value='Synthetic Long Passphrase 2026';"+
   "document.querySelector('#nkImport').click();return true;";
  assert.equal(await evalJS(code),true);
  await until("return !!document.querySelector('#nkOpenLocked');");
  assert.equal(await evalJS("return !!document.querySelector('.tree-property-button');"),false,
   "Synthetic portfolio must not remain active when real state was imported");
  let storage=await evalJS("const raw=localStorage.getItem('nkpro2_live_cloud_encrypted_v1');"+
   "return {exists:!!raw,plaintext:raw?.includes('Synthetic Tenant'),format:JSON.parse(raw||'{}').format};");
  assert.equal(storage.exists,true);assert.equal(storage.plaintext,false);
  assert.equal(storage.format,"nkpro2-encrypted-vault-v1");
  await evalJS("document.querySelector('#nkSyncButton').click();"+
   "document.querySelector('#nkSyncPassword').value='Synthetic Long Passphrase 2026';"+
   "document.querySelector('#nkUnlock').click();");
  await until("return document.querySelector('#appMain h1')?.textContent.includes('Objekt Am Rauhen Biehl 5');");
  assert.equal(await evalJS("return document.querySelectorAll('#portfolioTree button[data-nk-view]').length;"),6);
  assert.equal(await evalJS("return document.querySelectorAll('#appMain .nk-live-archive').length;"),5);
  await evalJS("document.querySelector('#nkSyncClose').click();");
  await shot("integrated-02-real-one-object-historical-overview");
  await evalJS("document.querySelector('#portfolioTree button[data-nk-view=tenancies]').click();");
  await until("return document.querySelector('#appMain h1')?.textContent==='Mietverhältnisse';");
  assert.equal(await evalJS("return document.querySelectorAll('#appMain .nk-live-table tbody tr').length;"),5);
  assert.ok(await evalJS("return document.querySelector('#appMain').textContent.includes('2010-01-01');"));
  await shot("integrated-03-five-real-tenancies");
  await evalJS("document.querySelector('#portfolioTree button[data-nk-view=archives]').click();");
  await until("return document.querySelectorAll('#appMain .nk-live-archive').length===5;");
  assert.equal(await evalJS("return document.querySelectorAll('#appMain .nk-live-archive b').length;"),5);
  await evalJS("[...document.querySelectorAll('#appMain .nk-live-archive')].find(e=>e.dataset.id==='2023full').click();");
  await until("return document.querySelector('#appMain h1')?.textContent==='Archiv 2023';");
  assert.equal(await evalJS("return document.querySelectorAll('#appMain .nk-live-table tbody tr').length;"),3);
  await shot("integrated-04-original-2023-archive");
  await evalJS("document.querySelector('#portfolioTree button[data-nk-view=year]').click();");
  await until("return document.querySelector('#appMain h1')?.textContent==='Jahresabrechnung 2025';");
  const annual=await evalJS("return document.querySelector('#appMain').textContent;");
  assert.ok(annual.includes("keine Altwerte")||annual.includes("nicht migriert"));
  assert.ok(annual.includes("Kosten erfasst"));
  assert.ok(!annual.includes("9.965,97"),"2025 Techem values must not appear");
  await shot("integrated-05-blank-2025");
  await cmd("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await pause(400);
  const mobile=await evalJS("return {v:innerWidth,s:document.documentElement.scrollWidth};");
  assert.ok(mobile.s<=mobile.v+2,"Unexpected mobile viewport overflow: "+JSON.stringify(mobile));
  await shot("integrated-06-mobile-2025");
  await evalJS("document.querySelector('#openMenu').click();");
  assert.equal(await evalJS("return document.body.classList.contains('menu-open');"),true,
   "Mobile navigation must open using existing layout class");
  await evalJS("document.querySelector('#portfolioTree button[data-nk-view=archives]').click();");
  await until("return document.querySelector('#appMain h1')?.textContent==='Historische Abrechnungen';");
  assert.equal(await evalJS("return document.body.classList.contains('menu-open');"),false);
  await shot("integrated-07-mobile-historical-archive");
  await until("return !!navigator.serviceWorker.controller;");
  await cmd("Network.enable");
  await cmd("Network.emulateNetworkConditions",{
   offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
  await cmd("Page.reload",{ignoreCache:true});
  await until("return !!document.querySelector('#nkOpenLocked');");
  await evalJS("document.querySelector('#nkSyncButton').click();"+
   "document.querySelector('#nkSyncPassword').value='Synthetic Long Passphrase 2026';"+
   "document.querySelector('#nkUnlock').click();");
  await until("return document.querySelector('#appMain h1')?.textContent.includes('Objekt Am Rauhen Biehl 5');");
  console.log("INTEGRATED_CHROMIUM_PASS: Systemstatus, 5 archives, one object, no legacy 2025 costs, AES cache, mobile and offline restore");
 }finally{
  if(ws&&ws.readyState===WebSocket.OPEN)ws.close();
  if(chrome&&!chrome.killed){
   chrome.kill("SIGTERM");
   if(chrome.exitCode===null)await Promise.race([new Promise(r=>chrome.once("exit",r)),pause(1000)]);
  }
  await new Promise(r=>server.close(r));
  if(profile)try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});}
   catch(e){if(!["ENOTEMPTY","EBUSY","EPERM"].includes(e.code))throw e;}
 }
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
