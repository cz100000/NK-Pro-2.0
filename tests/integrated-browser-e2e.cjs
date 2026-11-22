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
 if(u==="/__nk_test_legacy.json"){
  res.writeHead(200,{"Content-Type":"application/json","Cache-Control":"no-store"});
  res.end(JSON.stringify(source()));return;
 }
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
  await until("return !!window.NKPRO2_DEMO_TEST&&!!document.querySelector('#nkSyncPanel');");
  const demoBefore=await evalJS("const p=window.NKPRO2_DEMO_TEST.getPortfolio();"+
   "return p.objects.map(o=>o.id);");
  assert.deepEqual(demoBefore,["SYN-A","SYN-B","SYN-C"]);
  assert.equal(await evalJS("return document.querySelectorAll('#portfolioTree .tree-property-button').length;"),3);
  await shot("canonical-01-original-v013-demo-tree");
  await evalJS("document.querySelector('#nkSyncButton').click();");
  const json=JSON.stringify(source());
  const code="const dt=new DataTransfer();dt.items.add(new File(["+
   JSON.stringify(json)+"],'synthetic-source.json',{type:'application/json'}));"+
   "document.querySelector('#nkSource').files=dt.files;"+
   "document.querySelector('#nkSyncPassword').value='Synthetic Long Passphrase 2026';"+
   "document.querySelector('#nkImport').click();return true;";
  assert.equal(await evalJS(code),true);
  await until("return document.querySelector('#appMain h1')?.textContent==='Synthetisches Haus';");
  const tree=await evalJS("const t=document.querySelector('#portfolioTree');return {"+
   "names:[...t.querySelectorAll('.tree-property-label')].map(e=>e.textContent),"+
   "icons:t.querySelectorAll('.tree-property-button .tree-icon svg').length,"+
   "groups:[...t.querySelectorAll('.tree-group-label')].map(e=>e.textContent),"+
   "years:[...t.querySelectorAll('.tree-year-name')].map(e=>e.textContent.trim())};");
  assert.deepEqual(tree.names,["Synthetisches Haus","Musterobjekt B","Musterobjekt C"]);
  assert.equal(tree.icons,3);
  assert.deepEqual(tree.groups,["Stammdaten","Jahresabrechnungen"]);
  assert.deepEqual(tree.years,["2025","2024","2023","2022","2021/2022"]);
  const stored=await evalJS("const r=localStorage.getItem('nkpro2_live_cloud_encrypted_v1');"+
   "return {has:!!r,plain:r.includes('Synthetic Tenant'),format:JSON.parse(r).format};");
  assert.deepEqual(stored,{has:true,plain:false,format:"nkpro2-encrypted-vault-v1"});
  const unchanged=await evalJS("const p=window.NKPRO2_DEMO_TEST.getPortfolio();"+
   "return p.objects.map(o=>({id:o.id,years:Object.keys(o.settlements)}));");
  assert.deepEqual(unchanged.slice(1),[
   {id:"SYN-B",years:["2023","2024"]},{id:"SYN-C",years:["2023","2024"]}]);
  await evalJS("document.querySelector('#nkSyncClose').click();");
  await shot("canonical-02-real-A-unchanged-B-C");
  await evalJS("document.querySelector('#portfolioTree [data-action=toggle-tree-section][data-id=master]').click();");
  await until("return document.querySelectorAll('#portfolioTree .tree-subitem').length===4;");
  assert.equal(await evalJS("return document.querySelectorAll('#portfolioTree .tree-subitem .tree-icon svg').length;"),4);
  await shot("canonical-03-original-v013-expanded-master-tree");
  await evalJS("document.querySelector('#portfolioTree [data-action=open-object-tab][data-id=tenancies]').click();");
  await until("return document.querySelector('#appMain h1')?.textContent.includes('Mietverhältnisse');");
  assert.equal(await evalJS("return document.querySelectorAll('#appMain .data-table tbody tr').length;"),5);
  assert.ok(await evalJS("return document.querySelector('#appMain').textContent.includes('2010-01-01');"));
  await shot("canonical-04-original-v013-real-tenancies");
  const realId=await evalJS("return [...document.querySelectorAll('#portfolioTree .tree-property-button')]"+
   ".find(e=>e.textContent.includes('Synthetisches Haus')).dataset.id;");
  await evalJS("document.querySelector('#portfolioTree .tree-year[data-id="+JSON.stringify(realId+"|2023")+"]').click();");
  await until("return document.querySelector('#appMain h1')?.textContent==='Abrechnung 2023';");
  assert.equal(await evalJS("return document.querySelectorAll('#appMain section[data-archive-ref]').length;"),2);
  await shot("canonical-05-original-2023-two-snapshots");
  await evalJS("document.querySelector('#portfolioTree .tree-year[data-id="+JSON.stringify(realId+"|2025")+"]').click();");
  await until("return document.querySelector('#appMain h1')?.textContent==='Abrechnung 2025';");
  assert.ok(await evalJS("return document.querySelector('#appMain').textContent.includes('Keine Kosten');"));
  await shot("canonical-06-2025-blank");
  // Existing B/C fixtures must remain interactive through the SAME original controller.
  await evalJS("document.querySelector('#portfolioTree [data-action=select-property][data-id=SYN-B]').click();");
  await until("return document.querySelector('#appMain h1')?.textContent==='Musterobjekt B';");
  await evalJS("document.querySelector('#portfolioTree [data-action=object-billings][data-id=SYN-B]').click();");
  await until("return document.querySelector('#appMain h1')?.textContent==='Jahresabrechnungen';");
  assert.ok(await evalJS("return document.querySelector('#appMain').textContent.includes('Abrechnung 2024');"));
  await shot("canonical-07-sample-B-0.13-year-list");
  await evalJS("document.querySelector('#portfolioTree [data-action=select-property][data-id=SYN-C]').click();");
  await until("return document.querySelector('#appMain h1')?.textContent==='Musterobjekt C';");
  await shot("canonical-08-sample-C-0.13-object");
  // Original mobile sidebar, not the pale duplicate removed from integrated-app.
  await cmd("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await pause(300);
  const mobile=await evalJS("return {view:innerWidth,scroll:document.documentElement.scrollWidth};");
  assert.ok(mobile.scroll<=mobile.view+2,JSON.stringify(mobile));
  await evalJS("document.querySelector('#openMenu').click();");
  assert.ok(await evalJS("return document.body.classList.contains('menu-open');"));
  await shot("canonical-09-mobile-B-C-original-tree");
  await evalJS("document.querySelector('#portfolioTree [data-action=select-property][data-id="+JSON.stringify(realId)+"]').click();");
  await until("return document.querySelector('#appMain h1')?.textContent==='Synthetisches Haus';");
  await shot("canonical-10-mobile-real-A");
  await until("return !!navigator.serviceWorker.controller;");
  await cmd("Network.enable");
  await cmd("Network.emulateNetworkConditions",{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
  await cmd("Page.reload",{ignoreCache:true});
  await until("return !!window.NKPRO2_DEMO_TEST&&!!document.querySelector('#nkSyncPanel');");
  await evalJS("document.querySelector('#nkSyncButton').click();"+
   "document.querySelector('#nkSyncPassword').value='Synthetic Long Passphrase 2026';"+
   "document.querySelector('#nkUnlock').click();");
  await until("return document.querySelector('#appMain h1')?.textContent==='Synthetisches Haus';");
  assert.equal(await evalJS("return document.querySelectorAll('#portfolioTree .tree-property-button').length;"),3);
  await shot("canonical-11-offline-unlock-restored-tree");
  await cmd("Network.emulateNetworkConditions",{offline:false,latency:0,downloadThroughput:0,uploadThroughput:0});
  await evalJS("localStorage.removeItem('nkpro2_live_cloud_encrypted_v1');"+
   "sessionStorage.removeItem('__nk_test_cloud');");
  const mockDrive="(() => {\n const legacyFolder={id:\"old-folder\",name:\"NK-Pro – Privatdaten\",mimeType:\"application/vnd.google-apps.folder\"};\n const newFolder={id:\"new-folder\",name:\"NK-Pro 2.0 – Privatdaten\",mimeType:\"application/vnd.google-apps.folder\"};\n const legacyFile={id:\"legacy-2026\",name:\"nkpro-cloud-snapshot-2026-11-21T19-34-02-synthetic-snapshot-2026-xx.json\",mimeType:\"application/json\",size:\"10000\",parents:[\"old-folder\"],createdTime:\"2026-11-21T19:34:02Z\"};\n const mockRead=()=>JSON.parse(sessionStorage.getItem(\"__nk_test_cloud\")||\"[]\");\n const mockSave=records=>sessionStorage.setItem(\"__nk_test_cloud\",JSON.stringify(records));\n const respond=data=>new Response(JSON.stringify(data),{status:200,headers:{\"Content-Type\":\"application/json\"}});\n const nativeFetch=window.fetch.bind(window);\n window.google={accounts:{oauth2:{initTokenClient:cfg=>({\n  requestAccessToken:()=>cfg.callback({access_token:\"synthetic-oauth-token\",expires_in:3600})\n })}}};\n window.fetch=async (url,options={})=>{\n  if(typeof url===\"string\"&&url.startsWith(\"https://www.googleapis.com/\")){\n   const u=new URL(url),q=u.searchParams.get(\"q\")||\"\",method=options.method||\"GET\";\n   if(u.pathname===\"/drive/v3/files\"&&method===\"GET\"){\n    if(q.includes(\"mimeType = 'application/vnd.google-apps.folder'\"))\n     return respond({files:q.includes(\"NK-Pro 2.0\")?[newFolder]:[legacyFolder]});\n    if(q.includes(\"'old-folder' in parents\"))return respond({files:[legacyFile]});\n    if(q.includes(\"nkpro2-vault-v1-\"))return respond({files:mockRead().map(x=>x.metadata)});\n    throw Error(\"Unexpected Drive list query \"+q);\n   }\n   if(u.pathname.startsWith(\"/drive/v3/files/\")&&method===\"GET\"){\n    const id=u.pathname.split(\"/\").pop();\n    if(id===\"legacy-2026\")return nativeFetch(\"/__nk_test_legacy.json\");\n    const f=mockRead().find(x=>x.metadata.id===id);\n    return f?respond(f.encrypted):new Response(\"\",{status:404});\n   }\n   if(u.pathname===\"/upload/drive/v3/files\"&&method===\"POST\"){\n    const body=await options.body.text(),boundary=options.body.type.split(\"boundary=\")[1];\n    const parts=body.split(\"--\"+boundary).filter(x=>x.includes(\"Content-Type: application/json\"));\n    if(parts.length!==2)throw Error(\"multipart upload malformed\");\n    const [meta,encrypted]=parts.map(x=>JSON.parse(x.slice(x.indexOf(\"\\r\\n\\r\\n\")+4).trim()));\n    const records=mockRead(),metadata={...meta,id:\"new-\"+(records.length+1)};\n    records.push({metadata,encrypted});mockSave(records);\n    return respond(metadata);\n   }\n   throw Error(\"Unexpected Google Drive request \"+method+\" \"+u.pathname);\n  }\n  return nativeFetch(url,options);\n };\n})();";
  await cmd("Page.addScriptToEvaluateOnNewDocument",{source:mockDrive});
  await cmd("Page.reload",{ignoreCache:true});
  await until("return !!window.NKPRO2_DEMO_TEST&&!!document.querySelector('#nkSyncPanel');");
  await evalJS("document.querySelector('#nkSyncButton').click();"+
   "document.querySelector('#nkSyncPassword').value='Synthetic Long Passphrase 2026';"+
   "document.querySelector('#nkConnect').click();");
  await until("return !document.querySelector('#nkImportDrive').disabled;");
  await evalJS("document.querySelector('#nkImportDrive').click();");
  await until("return document.querySelector('#appMain h1')?.textContent==='Synthetisches Haus';");
  const synced=await evalJS("const r=JSON.parse(sessionStorage.getItem('__nk_test_cloud')||'[]');"+
   "return {count:r.length,folder:r[0]?.metadata?.parents?.[0],"+
   "cipher:r[0]?.encrypted?.format,plain:JSON.stringify(r).includes('Synthetic Tenant')};");
  assert.deepEqual(synced,{count:1,folder:"new-folder",cipher:"nkpro2-encrypted-vault-v1",plain:false});
  assert.equal(await evalJS("return document.querySelectorAll('#portfolioTree .tree-property-button').length;"),3);
  await shot("canonical-12-one-click-cloud-import");
  console.log("CANONICAL_MIXED_PASS: identical 0.13 tree, real A, B/C samples, 2023 pair, blank 2025, mobile/offline and encrypted Drive");
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
