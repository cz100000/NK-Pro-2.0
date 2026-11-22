/* NK-Pro 2.0 private workspace. No private records in code/repository/URLs.
   Never load on the shared NK-Pro 1.0 GitHub Pages origin. */
(() => {"use strict";
 const model=globalThis.NKPRO2_PRIVATE_MODEL,cryptoBox=globalThis.NKPRO2_VAULT_CRYPTO,
  driveAPI=globalThis.NKPRO2_PRIVATE_DRIVE;
 if(!model||!cryptoBox||!driveAPI)throw new Error("PRIVATE_MODULES_MISSING");
 const DEFAULT_OAUTH_CLIENT_ID="603460345425-d6b85th20j9vnvj38lmrr9ndbordguo7.apps.googleusercontent.com";
 const KEY="nkpro2_private_encrypted_local_v1",OLD="nkpro2_private_previous_encrypted_v1",
  CONFIG="nkpro2_private_oauth_client_id_v1";
 const $=id=>document.getElementById(id);
 const safe=x=>String(x??"").replace(/[&<>"']/g,c=>({
   "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
 const money=n=>n==null?"–":(n/100).toLocaleString("de-DE",{style:"currency",currency:"EUR"});
 const text=(id,s)=>{$(id).textContent=String(s)};
 let vault=null,passphrase=null,remoteId=null,dirty=false,busy=false;
 let cachedRevision=localStorage.getItem(KEY),drive=driveAPI.create();
 const blocked=location.hostname.endsWith(".github.io")||
  !(location.protocol==="https:"||["localhost","127.0.0.1"].includes(location.hostname));
 if(blocked){
  const warning=$("securityWarning");warning.hidden=false;
  warning.textContent="Sicherheitssperre: Dieser private Datenbereich darf ausschließlich über eine eigene HTTPS-Adresse geladen werden. Die öffentliche GitHub-Pages-Demo teilt den Speicherbereich mit NK-Pro 1.0. Hier werden keine Echtdaten verarbeitet.";
  for(const button of document.querySelectorAll("button"))button.disabled=true;
  for(const input of document.querySelectorAll("input"))input.disabled=true;
  return;
 }
 const status=(s,type="")=>{$("message").textContent=String(s);$("message").className="message "+type;};
 const fail=e=>{status("Aktion abgebrochen: "+String(e?.message||e).replace(/Bearer\s+\S+/g,"[redacted]"),"error");};
 const requirePass=()=>{
  const input=$("vaultPassphrase").value;
  const value=passphrase||input;
  if(typeof value!=="string"||value.length<14)throw new Error("Tresor-Passwort mit mindestens 14 Zeichen eingeben.");
  return value;
 };
 function downloadEncrypted(textValue,name){
  const blob=new Blob([textValue],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
 }
 function backupLocal(){
  const current=localStorage.getItem(KEY);
  if(current){
   localStorage.setItem(OLD,current);
   downloadEncrypted(current,"NK-Pro-2.0-verschluesselte-Sicherung-"+new Date().toISOString().slice(0,10)+".json");
  }
 }
 function enableActions(){
  $("exportEncrypted").disabled=!localStorage.getItem(KEY);
  $("checkDrive").disabled=!drive.isConnected();
  $("cloudPull").disabled=!drive.isConnected();
  $("cloudPush").disabled=!drive.isConnected()||!vault;
  text("topStatus",!vault?"Gesperrt":dirty?"Lokal geändert – Cloud ausstehend":"Tresor bereit");
  text("localStatus",vault?("Privater Arbeitsstand geöffnet. "+(dirty?"Noch nicht synchronisiert.":"Letzter Cloud-Stand: "+(remoteId||"ohne"))):
   localStorage.getItem(KEY)?"Verschlüsselter lokaler Stand vorhanden; Passwort zum Öffnen eingeben.":"Kein lokaler Datenbestand.");
  text("cloudStatus",drive.isConnected()?"Google Drive verbunden. Daten sind Ende-zu-Ende-verschlüsselt.":"Google Drive nicht verbunden.");
 }
 async function saveLocal(){
  if(!vault)throw new Error("Kein Datentresor geladen.");
  if(localStorage.getItem(KEY)!==cachedRevision)
   throw new Error("Anderer Tab hat den lokalen Stand geändert. Bitte neu öffnen.");
  const envelope=await cryptoBox.encrypt({portfolio:vault,remoteId,dirty},
   requirePass(),{vaultId:"nkpro2-local-cache"});
  const serialized=JSON.stringify(envelope);
  localStorage.setItem(KEY,serialized);cachedRevision=serialized;
  enableActions();
 }
 function render(){
  $("dataPanel").hidden=!vault;enableActions();
  if(!vault)return;
  model.validatePortfolio(vault);
  const o=vault.objects[0],sum=model.summary(vault);
  text("objectName",o.name);
  const values=[
   [sum.unitCount,"Wohnungen"],[sum.tenancyCount,"Abrechnungsfälle"],
   [sum.areaSqm.toLocaleString("de-DE")+" m²","Gesamtfläche"],
   [sum.meterCount,"Zähler"],[sum.archiveCount,"Archivstände"]
  ];
  $("numbers").innerHTML=values.map(x=>'<div class="number"><b>'+safe(x[0])+
    '</b><span>'+safe(x[1])+'</span></div>').join("");
  const members=new Map(o.tenancies.map(t=>[t.unitId,t]));
  $("unitRows").innerHTML=o.units.map(u=>{
   const t=members.get(u.id);
   return "<tr><td>"+safe(u.label)+"</td><td>"+safe(u.areaSqm.toLocaleString("de-DE"))+
    " m²</td><td>"+safe(t?.name||"Leerstand")+"</td><td>"+
    safe(t?.privateUse?"Privatanteil":t?.role||"Leerstand")+"</td></tr>";
  }).join("");
  $("archiveList").innerHTML=o.archives.map(a=>"<span>"+safe(a.year)+" · "+
    safe(a.status==="complete"?"Vollständiger Stand":"Historischer Teilstand")+"</span>").join("");
 }
 async function guarded(fn){
  if(busy)return;
  busy=true;
  for(const id of ["importSnapshot","cloudPull","cloudPush","unlockLocal","connectDrive","checkDrive"])
   $(id).disabled=true;
  try{await fn();}catch(e){fail(e);}finally{busy=false;enableActions();}
 }
 $("unlockLocal").addEventListener("click",()=>guarded(async()=>{
  const raw=localStorage.getItem(KEY);
  if(!raw)throw new Error("Noch keine verschlüsselte lokale Sicherung.");
  const p=requirePass(),entry=await cryptoBox.decrypt(JSON.parse(raw),p);
  model.validatePortfolio(entry.portfolio);
  vault=entry.portfolio;remoteId=entry.remoteId||null;dirty=entry.dirty===true;
  passphrase=p;$("vaultPassphrase").value="";cachedRevision=raw;
  render();status("Verschlüsselter lokaler Stand erfolgreich geöffnet.","success");
 }));
 $("exportEncrypted").addEventListener("click",()=>{
  const raw=localStorage.getItem(KEY);
  if(raw)downloadEncrypted(raw,"NK-Pro-2.0-Tresor-Sicherung.json");
 });
 $("importSnapshot").addEventListener("click",()=>guarded(async()=>{
  const p=requirePass(),file=$("snapshotFile").files[0];
  if(!file)throw new Error("Original-Cloud-Snapshot auswählen.");
  if(file.size>20*1024*1024)throw new Error("Datei größer als 20 MB; abgebrochen.");
  const original=JSON.parse(await file.text());
  const fresh=model.migrate(original);
  if(cachedRevision){
   if(!confirm("Ein privater Arbeitsstand liegt lokal vor. Eine verschlüsselte Sicherung wird vor dem Ersetzen heruntergeladen. Wirklich neu importieren?"))return;
   backupLocal();
  }
  vault=fresh;passphrase=p;remoteId=null;dirty=true;
  $("vaultPassphrase").value="";await saveLocal();render();
  status("Originalintegrität geprüft; 2025 und historische Archive übernommen. Lokaler Tresor verschlüsselt. Cloud noch nicht befüllt.","success");
 }));
 $("connectDrive").addEventListener("click",()=>guarded(async()=>{
  const clientId=$("oauthClient").value.trim();
  await drive.signIn(clientId);
  localStorage.setItem(CONFIG,clientId);
  status("Google Drive verbunden. Du kannst nun den privaten Tresor synchronisieren.","success");
 }));
 $("checkDrive").addEventListener("click",()=>guarded(async()=>{
  const h=await drive.history();
  status(h.head?"Cloud enthält "+h.count+" verschlüsselte Version(en). Aktuelle Datei-ID: "+h.head.id:
   "Noch kein NK-Pro-2.0-Tresor in diesem Google-Konto.");
 }));
 async function receiveCloud(manual){
  if(!drive.isConnected())throw new Error("Erst mit Google verbinden.");
  const h=await drive.history();
  if(!h.head)throw new Error("Noch keine privaten NK-Pro-2.0-Cloud-Daten gefunden.");
  if(!vault&&cachedRevision)throw new Error("Verschlüsselten lokalen Stand zuerst entsperren. Cloud darf gesperrte lokale Daten nicht überschreiben.");
  if(dirty)throw new Error("Lokale Änderungen vorhanden. Vor einem Cloud-Laden bitte Konflikt manuell klären; es wird nichts überschrieben.");
  if(!manual&&(!vault||!remoteId))return;
  if(!manual&&h.head.id===remoteId)return;
  const envelope=await drive.read(h.head.id);
  if(remoteId&&remoteId!==h.head.id){
   let parent=envelope.parentId,depth=0;
   while(parent&&parent!==remoteId&&depth++<250){
    const previous=await drive.read(parent);parent=previous.parentId;
   }
   if(parent!==remoteId)throw new Error("DRIVE_PARENT_CHAIN_CONFLICT");
  }
  const data=await cryptoBox.decrypt(envelope,requirePass());
  model.validatePortfolio(data);
  if(vault){
   const prev=localStorage.getItem(KEY);
   if(prev)localStorage.setItem(OLD,prev);
  }
  vault=data;remoteId=h.head.id;dirty=false;await saveLocal();
  render();status("Aktueller Google-Drive-Stand verschlüsselt geladen.","success");
 }
 $("cloudPull").addEventListener("click",()=>guarded(()=>receiveCloud(true)));
 async function sendCloud(){
  if(!vault)throw new Error("Erst Datentresor importieren oder öffnen.");
  const sourceRevision=JSON.stringify(vault),expected=remoteId;
  const envelope=await cryptoBox.encrypt(vault,requirePass(),{
   vaultId:"nkpro2-main",parentId:expected});
  const result=await drive.uploadEnvelope(envelope,expected);
  if(JSON.stringify(vault)!==sourceRevision){
   dirty=true;await saveLocal();throw new Error("LOCAL_CHANGED_DURING_UPLOAD");
  }
  remoteId=result.fileId;dirty=false;await saveLocal();
  status("Neue verschlüsselte Drive-Version gespeichert und zurückgelesen. Versionen: "+result.count,"success");
 }
 $("cloudPush").addEventListener("click",()=>guarded(sendCloud));
 async function automatic(){
  if(busy||!drive.isConnected()||!vault)return;
  if(document.hidden)return;
  await guarded(async()=>{
   if(dirty)await sendCloud();
   else await receiveCloud(false);
  });
 }
 setInterval(()=>automatic().catch(fail),45000);
 window.addEventListener("focus",()=>automatic().catch(fail));
 $("oauthClient").value=localStorage.getItem(CONFIG)||DEFAULT_OAUTH_CLIENT_ID;
 enableActions();
 status("Privaten Datenbestand lokal importieren oder verschlüsselten Stand öffnen. Cloud-Zugriff erfordert Google-Anmeldung.");
})();