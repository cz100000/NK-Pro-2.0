"use strict";
/* Browser-only private vault acceptance. Synthetic fixtures exclusively. */
const assert=require("node:assert/strict"),fs=require("node:fs"),os=require("node:os"),
 path=require("node:path"),http=require("node:http"),cp=require("node:child_process");
const root=path.resolve(__dirname,".."),screens=path.join(root,"_visual-test-artifacts");
fs.mkdirSync(screens,{recursive:true});
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent((req.url||"/").split("?")[0]);
 const filepath=path.resolve(root,"."+(pathname==="/private/"?"/private/index.html":pathname));
 if(!filepath.startsWith(path.join(root,"private")+path.sep)||
   !fs.existsSync(filepath)||!fs.statSync(filepath).isFile()){
  res.writeHead(404);res.end();return;
 }
 const ct={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8",".webmanifest":"application/manifest+json"};
 res.writeHead(200,{"content-type":ct[path.extname(filepath)]||"text/plain",
  "cache-control":"no-store"});
 fs.createReadStream(filepath).pipe(res);
});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const browser=()=>{
 for(const x of [process.env.CHROME_BIN,"google-chrome","google-chrome-stable",
   "chromium","chromium-browser","/usr/bin/chromium","/usr/bin/google-chrome"])
  if(x&&cp.spawnSync(x,["--version"],{timeout:4000}).status===0)return x;
 throw new Error("Chrome required for private browser acceptance");
};
(async()=>{
 let chrome,ws,profile;
 try{
  await new Promise(r=>server.listen(0,"127.0.0.1",r));
  const url="http://127.0.0.1:"+server.address().port+"/private/index.html";
  profile=fs.mkdtempSync(path.join(os.tmpdir(),"nkpro2-private-"));
  chrome=cp.spawn(browser(),["--headless=new","--no-sandbox","--disable-gpu",
   "--disable-dev-shm-usage","--remote-allow-origins=*","--no-first-run",
   "--remote-debugging-port=0","--user-data-dir="+profile,"about:blank"],{stdio:"ignore"});
  const marker=path.join(profile,"DevToolsActivePort");let port=0;
  for(let i=0;i<250;i++){
   if(fs.existsSync(marker)){port=Number(fs.readFileSync(marker,"utf8").split("\n")[0]);break;}
   if(chrome.exitCode!==null)throw Error("Chromium exited");
   await sleep(100);
  }
  assert.ok(port);
  const targets=await fetch("http://127.0.0.1:"+port+"/json/list").then(r=>r.json());
  ws=new WebSocket(targets.find(t=>t.type==="page").webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.addEventListener("open",resolve,{once:true});ws.addEventListener("error",reject,{once:true});});
  let seq=0;const pending=new Map();
  ws.addEventListener("message",event=>{
   const d=JSON.parse(event.data);if(!d.id||!pending.has(d.id))return;
   const p=pending.get(d.id);pending.delete(d.id);
   d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);
  });
  const cmd=(method,params={})=>new Promise((resolve,reject)=>{
   const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));
   setTimeout(()=>{if(pending.has(id)){pending.delete(id);reject(Error("Timeout "+method));}},12000).unref();
  });
  const evalJS=async source=>{
   const r=await cmd("Runtime.evaluate",{expression:"(function(){"+source+"})()",returnByValue:true,awaitPromise:true});
   if(r.exceptionDetails)throw Error("Browser: "+JSON.stringify(r.exceptionDetails));
   return r.result.value;
  };
  const until=async(source)=>{for(let n=0;n<80;n++){if(await evalJS(source))return;await sleep(100);}throw Error("Page did not reach expected state");};
  const screenshot=async name=>{
   const r=await cmd("Page.captureScreenshot",{format:"png",fromSurface:true});
   const p=path.join(screens,name+".png");
   fs.writeFileSync(p,Buffer.from(r.data,"base64"));
   assert.ok(fs.statSync(p).size>7000);
  };
  await cmd("Page.enable");await cmd("Runtime.enable");
  await cmd("Emulation.setDeviceMetricsOverride",{width:1350,height:900,deviceScaleFactor:1,mobile:false});
  await cmd("Page.navigate",{url});
  await until("return document.querySelector('#importSnapshot')&&window.NKPRO2_PRIVATE_MODEL&&document.querySelector('#message').textContent.length>0;");
  assert.equal(await evalJS("return document.querySelector('#securityWarning').hidden;"),true);
  assert.equal(await evalJS("return document.querySelector('#dataPanel').hidden;"),true);
  assert.equal(await evalJS("return document.querySelector('#cloudPush').disabled;"),true);
  await screenshot("private-01-desktop-locked");
  const imported=await evalJS("const m=NKPRO2_PRIVATE_MODEL;"+
   "const u={id:'W000.UG',wohnflaeche:65,bezeichnung:'UG',lage:'UG',gebaeudeId:'B-1'};"+
   "const t={id:'M000',wohnung:'W000.UG',name:'Synthetic Tenant',einzug:'2024-01-01',personen:1,abrechnungRolle:'Eigentümer/Privat'};"+
   "const d={meta:{dataSchemaVersion:5,abrechnungsjahr:'2025',abrechnungsbeginn:'2025-01-01',abrechnungsende:'2025-12-31',currentBillingFinalized:false,storageIntegrityAlgorithm:'FNV1A32'},"+
   "wohnungen:[u],mieter:[t],kostenarten:[{id:'K002',kostenart:'Wasserversorgung',gesamtbetrag:100,inNK:'Ja'}],"+
   "stammdaten:{wohnungen:[u],mieter:[t]},objektStandard:{objekt:{id:'O-1',bezeichnung:'Synthetisches Haus'},einheiten:[u],gebaeude:[],kostenarten:[],vertraege:[],partner:[]},"+
   "zaehlerDaten:{zaehler:[{zaehlerId:'Z-1',einheitId:'W000.UG'}],messwerte:[{messwertId:'R-1',wert:1,zaehlerId:'Z-1'}],messperioden:[],zuordnungen:[],zaehlerwechsel:[]},"+
   "vorauszahlungen:[],umlageInputs:{},jahresArchiv:[]};"+
   "const c=JSON.parse(JSON.stringify(d));delete c.meta.storageIntegrityAlgorithm;d.meta.storageIntegrityChecksum=m.fnv(JSON.stringify(c));"+
   "const snapshot={format:'nkpro-drive-snapshot-v1',snapshotId:'synthetic-snapshot-001',appVersion:'V99.4.81',data:d};"+
   "const dt=new DataTransfer();dt.items.add(new File([JSON.stringify(snapshot)],'synthetic.json',{type:'application/json'}));"+
   "document.querySelector('#snapshotFile').files=dt.files;"+
   "document.querySelector('#vaultPassphrase').value='Synthetic Long Passphrase 2026';"+
   "document.querySelector('#importSnapshot').click();return true;");
  assert.equal(imported,true);
  await until("return !document.querySelector('#dataPanel').hidden;");
  assert.equal(await evalJS("return document.querySelectorAll('#unitRows tr').length;"),1);
  assert.equal(await evalJS("return document.querySelector('#objectName').textContent;"),"Synthetisches Haus");
  const storage=await evalJS("const s=localStorage.getItem('nkpro2_private_encrypted_local_v1');return {present:!!s,hasPlain:s.includes('Synthetic Tenant'),hasCipher:!!JSON.parse(s).ciphertext,scope:!!navigator.serviceWorker};");
  assert.deepEqual(storage,{present:true,hasPlain:false,hasCipher:true,scope:true});
  await screenshot("private-02-desktop-migrated");
  await cmd("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await sleep(300);
  assert.ok(await evalJS("return document.documentElement.scrollWidth<=innerWidth+2;"));
  await screenshot("private-03-mobile-migrated");
  await until("return !!navigator.serviceWorker.controller;");
  await cmd("Network.enable");
  await cmd("Network.emulateNetworkConditions",{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
  await cmd("Page.reload",{ignoreCache:true});
  await until("return !!document.querySelector('#unlockLocal');");
  assert.equal(await evalJS("return document.querySelector('#dataPanel').hidden;"),true);
  await evalJS("document.querySelector('#vaultPassphrase').value='Synthetic Long Passphrase 2026';document.querySelector('#unlockLocal').click();");
  await until("return !document.querySelector('#dataPanel').hidden;");
  assert.equal(await evalJS("return document.querySelectorAll('#unitRows tr').length;"),1);
  console.log("PRIVATE_BROWSER_ACCEPTANCE_OK: desktop, mobile, encrypted cache, offline reload/unlock; no private source in repository");
 }finally{
  if(ws&&ws.readyState===WebSocket.OPEN)ws.close();
  if(chrome&&!chrome.killed){chrome.kill("SIGTERM");
   if(chrome.exitCode===null)await Promise.race([new Promise(r=>chrome.once("exit",r)),sleep(1000)]);
  }
  await new Promise(r=>server.close(r));
  if(profile){try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:3,retryDelay:200});}
   catch(error){if(!["ENOTEMPTY","EBUSY","EPERM"].includes(error.code))throw error;
    console.warn("Chrome background service worker delayed temporary profile cleanup; test results remain valid.");}
  }
 }
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
