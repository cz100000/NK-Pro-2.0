/* NK-Pro 2.0 – integrated Google Drive/Schema 5 master + historical archives.
 * No standalone vault page. Real 2025 accounting stays empty, unapproved. */
(() => {"use strict";
 const model=window.NKPRO2_INTEGRATED_DATA,validSource=window.NKPRO2_PRIVATE_MODEL,
  cipher=window.NKPRO2_VAULT_CRYPTO,driveAPI=window.NKPRO2_PRIVATE_DRIVE;
 if(!model||!validSource||!cipher||!driveAPI)throw Error("INTEGRATED_MODULES_REQUIRED");
 const KEY="nkpro2_live_cloud_encrypted_v1",OLD="nkpro2_live_previous_encrypted_v1",
  CLIENT="603460345425-d6b85th20j9vnvj38lmrr9ndbordguo7.apps.googleusercontent.com";
 const $=id=>document.getElementById(id);
 const clean=v=>String(v??"").replace(/[&<>"']/g,c=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
 }[c]));
 const eur=v=>typeof v==="number"&&Number.isFinite(v)?
  v.toLocaleString("de-DE",{style:"currency",currency:"EUR"}):"–";
 const number=v=>Number(v||0).toLocaleString("de-DE",{maximumFractionDigits:1});
 let state=null,secret=null,remote=null,dirty=false,revision=localStorage.getItem(KEY),
  drive=driveAPI.create(),busy=false,view="overview",archiveId=null,started=false,live=false,
  legacyCandidate=null,remoteExisting=false;
 function status(msg,error=false){const el=$("nkSyncMessage");if(!el)return;
  el.textContent=String(msg);el.classList.toggle("error",error);}
 function password(){const v=secret||$("nkSyncPassword").value;
  if(!v||v.length<14)throw Error("Datenpasswort mit mindestens 14 Zeichen eingeben.");
  return v;}
 function setStatus(){
  if(!$("nkSyncLabel"))return;
  $("nkSyncLabel").textContent=live?(drive.isConnected()?(dirty?
   "Google Drive · ungesichert":"Google Drive · verbunden"):(state?
    "Lokal verschlüsselt":"Echtdaten gesperrt")):(drive.isConnected()?
    "Google Drive · verbunden":"Google Drive · verbinden");
  $("nkSyncDot").classList.toggle("signal-on",drive.isConnected());
  for(const name of ["nkImport","nkImportDrive","nkUnlock","nkConnect","nkPull","nkPush","nkBackup"])
   if($(name))$(name).disabled=busy;
  $("nkUnlock").disabled=busy||!revision;
  $("nkPush").disabled=busy||!state||!drive.isConnected();
  $("nkPull").disabled=busy||!drive.isConnected();
  $("nkBackup").disabled=busy||!localStorage.getItem(KEY);
  const existingLocal=!!revision;
  const localLocked=existingLocal&&!state;
  $("nkImportDrive").disabled=busy||!drive.isConnected()||existingLocal||!!state||
   !legacyCandidate||remoteExisting;
  $("nkImportDrive").title=existingLocal||state?
   "Ein verschlüsselter 2.0-Datenbestand liegt bereits vor. Erst öffnen, nicht erneut importieren.":
   remoteExisting?"Ein 2.0-Cloudbestand existiert bereits. Bitte aus Google Drive laden.":
   !drive.isConnected()?"Bitte zuerst Google verbinden.":
   !legacyCandidate?"Kein alter NK-Pro-1.0-Snapshot gefunden.":"Altbestand übernehmen.";
  $("nkUnlock").classList.toggle("secondary",!localLocked);
  $("nkLocalMessage").textContent=state?
   "NK-Pro-2.0-Datenbestand geöffnet."+(dirty?" Noch nicht in Google Drive gesichert.":""):
   existingLocal?"Ein verschlüsselter NK-Pro-2.0-Datenbestand ist bereits auf diesem Gerät vorhanden.":
   "Noch kein privater NK-Pro-2.0-Datenbestand auf diesem Gerät.";
  const callout=$("nkSyncCallout");
  if(callout){
   let advice="";
   if(localLocked)
    advice="Die Altdatenübernahme ist auf diesem Gerät offenbar bereits erfolgt. "+
     "Deshalb ist ein zweiter Import zum Schutz deiner Daten gesperrt. "+
     "Bitte mit dem bei der ersten Übernahme festgelegten Passwort auf „Lokale Daten öffnen“ klicken. "+
     "Danach die historischen Daten prüfen und gegebenenfalls „Verschlüsselt in Drive sichern“ wählen.";
   else if(state&&dirty&&drive.isConnected())
    advice="Der Datenbestand ist geöffnet und wurde noch nicht in Google Drive gesichert. "+
     "Nächster Schritt: „Verschlüsselt in Drive sichern“. Kein erneuter Import erforderlich.";
   else if(state&&dirty)
    advice="Der Datenbestand ist lokal geöffnet. Bitte „Google verbinden“ wählen, "+
     "anschließend „Verschlüsselt in Drive sichern“. Kein erneuter Import erforderlich.";
   else if(state&&remote)
    advice="Der bestehende 2.0-Datenbestand wurde entsperrt. "+
     "Eine erneute Übernahme aus NK-Pro 1.0 ist nicht erforderlich.";
   else if(!existingLocal&&remoteExisting)
    advice="Google Drive enthält bereits einen NK-Pro-2.0-Datenbestand. "+
     "Bitte „Aus Google Drive laden“ wählen statt die Altdaten nochmals zu importieren.";
   else if(!existingLocal&&drive.isConnected()&&legacyCandidate)
    advice="Die alten Daten sind verfügbar. Datenpasswort eingeben und "+
     "„Altdaten direkt aus Drive übernehmen“ wählen. 2025 wird nicht übertragen.";
   callout.textContent=advice;
   callout.hidden=!advice;
  }
 }
 const action=fn=>async()=>{if(busy)return;busy=true;setStatus();try{await fn();}
  catch(e){status("Aktion fehlgeschlagen: "+String(e?.message||e),true);}
  finally{busy=false;setStatus();}};
 function download(raw,name){const url=URL.createObjectURL(new Blob([raw],{type:"application/json"}));
  const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);
  a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),20000);}
 async function save(){
  model.validate(state);
  if(localStorage.getItem(KEY)!==revision)throw Error("Anderer Tab hat lokale Daten geändert.");
  const blob=await cipher.encrypt({portfolio:state,remoteId:remote,dirty},
   password(),{vaultId:"nkpro2-local-integrated"});
  const raw=JSON.stringify(blob);localStorage.setItem(KEY,raw);revision=raw;setStatus();
 }
 async function importSource(){
  const f=$("nkSource").files[0];if(!f)throw Error("Original-Cloud-Snapshot auswählen.");
  if(f.size>20*1024*1024)throw Error("Quelldatei zu groß.");
  const pass=password();
  const newState=model.migrate(JSON.parse(await f.text()));
  if(revision){
   if(!confirm("Vorhandenen Echtdatenbestand ersetzen? Es wird zuerst eine verschlüsselte Sicherung heruntergeladen."))return;
   localStorage.setItem(OLD,revision);
   download(revision,"NKPro2-vor-Neuimport-verschluesselt.json");
  }
  state=newState;secret=pass;remote=null;dirty=true;await save();
  $("nkSyncPassword").value="";
  status("Sieben Wohnungen, fünf Mietverhältnisse und fünf historische Archivstände übernommen. Alle 2025-Abrechnungswerte bleiben leer.");
  if(!live){location.reload();return;}render();
 }
 async function unlock(){
  if(!revision)throw Error("Keine lokalen Echtdaten vorhanden.");
  const pass=password(),item=await cipher.decrypt(JSON.parse(revision),pass);
  model.validate(item.portfolio);
  state=item.portfolio;remote=item.remoteId||null;dirty=item.dirty===true;secret=pass;
  $("nkSyncPassword").value="";if(live)render();
  const counts=model.summary(state);
  status("Datenbestand geöffnet: "+counts.apartments+" Wohnungen, "+
   counts.tenancies+" Mietverhältnisse und "+counts.archiveCount+
   " historische Archive. "+(dirty?
    (drive.isConnected()?"Bitte jetzt „Verschlüsselt in Drive sichern“.":"Bitte Google verbinden und danach in Drive sichern."):
    "Ein erneuter Import ist nicht erforderlich."));
 }
 async function connect(){
  await drive.signIn(CLIENT);
  const h=await drive.history();
  remoteExisting=!!h.head;legacyCandidate=null;
  if(h.head){
   status("Google Drive verbunden. Ein NK-Pro-2.0-Datenbestand ist bereits vorhanden. "+
    (revision?"Bitte zuerst den vorhandenen lokalen Stand entsperren und vergleichen.":
     "Bitte „Aus Google Drive laden“ verwenden. Keine vorhandenen Daten werden überschrieben."));
  }else if(revision||state){
   status("Google Drive verbunden. Auf diesem Gerät ist bereits ein verschlüsselter "+
    "NK-Pro-2.0-Datenbestand vorhanden. Bitte erst „Lokale Daten öffnen“ und danach "+
    "„Verschlüsselt in Drive sichern“. Kein erneuter Altimport nötig.");
  }else{
   const sources=await drive.legacySnapshots();
   legacyCandidate=sources[0]||null;
   status(legacyCandidate?
    "Google verbunden: Originaldaten aus NK-Pro 1.0 gefunden. "+
    "Bitte Datenpasswort festlegen und „Altdaten direkt aus Drive übernehmen“ wählen. "+
    "Die Abrechnung 2025 bleibt neu und leer.":
    "Google verbunden, aber keine mit diesem OAuth-Client sichtbaren NK-Pro-1.0-Snapshots. "+
    "Der manuelle Import ist als Ersatzweg verfügbar.");
  }
  setStatus();
 }
 async function importDirectlyFromDrive(){
  if(revision||state)throw Error("Es ist bereits ein lokaler 2.0-Datenbestand vorhanden. "+
   "Dieser wird nicht überschrieben.");
  if(!drive.isConnected())throw Error("Bitte zuerst mit Google verbinden.");
  const pass=password();
  const remoteState=await drive.history();
  if(remoteState.head)throw Error("Ein 2.0-Cloudbestand existiert bereits. "+
   "Bitte stattdessen „Aus Google Drive laden“ verwenden.");
  const sources=await drive.legacySnapshots();
  if(!sources.length)throw Error("Keine autorisierten NK-Pro-1.0-Quellsicherungen gefunden.");
  const latest=sources[0];
  const snapshot=await drive.readLegacySnapshot(latest.id);
  const migrated=model.migrate(snapshot);
  const counts=model.summary(migrated);
  if(counts.objectCount!==1||counts.apartments!==7||
   counts.archiveCount!==5||counts.year2025Migrated!==false||
   counts.current2025CostCount!==0)
   throw Error("Abnahme der historischen Daten fehlgeschlagen. Nichts importiert.");
  /* Commit locally first. Nothing is written back into the 1.0 Drive folder. */
  state=migrated;secret=pass;remote=null;dirty=true;
  await save();$("nkSyncPassword").value="";
  sessionStorage.setItem("nkpro2_imported_message",
   "Historischer Datenbestand übernommen: 1 Objekt, 7 Wohnungen, 5 Mietverhältnisse, "+
   "5 Archive. 2025 wurde nicht migriert.");
  try {
   await push(true);
   sessionStorage.setItem("nkpro2_imported_message",
    "Historischer Bestand ist jetzt verschlüsselt in deinem Google Drive gesichert: "+
    "1 Objekt, 7 Wohnungen, 5 Mietverhältnisse und 5 Archive. 2025 bleibt leer.");
  } catch(error) {
   sessionStorage.setItem("nkpro2_imported_message",
    "Altdaten lokal verschlüsselt übernommen, aber Cloud-Sicherung noch ausstehend. "+
    "Bitte nach erneutem Verbinden „Verschlüsselt in Drive sichern“ wählen.");
  }
  if(!live){location.reload();return;}
  render();
  status(sessionStorage.getItem("nkpro2_imported_message"));
 }
 async function pull(){
  if(!drive.isConnected())throw Error("Google Drive noch nicht verbunden.");
  if(revision&&!state)throw Error("Lokalen Bestand zuerst entsperren.");
  if(dirty)throw Error("Ungesicherte lokale Änderungen. Kein Überschreiben.");
  const h=await drive.history();if(!h.head)throw Error("Keine 2.0-Cloudversion gefunden.");
  const enc=await drive.read(h.head.id);
  if(remote&&remote!==h.head.id){
   let parent=enc.parentId,n=0;
   while(parent&&parent!==remote&&n++<250)parent=(await drive.read(parent)).parentId;
   if(parent!==remote)throw Error("Cloud-Verlauf abweichend. Daten nicht ersetzt.");
  }
  const pass=password(),loaded=await cipher.decrypt(enc,pass);
  model.validate(loaded);
  if(revision)localStorage.setItem(OLD,revision);
  state=loaded;secret=pass;remote=h.head.id;dirty=false;
  await save();$("nkSyncPassword").value="";status("Cloud-Daten erfolgreich geladen.");
  if(!live){location.reload();return;}render();
 }
 async function push(explicit){
  if(!drive.isConnected()||!state)throw Error("Erst Google verbinden und Daten öffnen.");
  if(!explicit&&!remote)return; // first upload is always intentional
  const h=await drive.history(),head=h.head?.id||null;
  if(head!==remote)throw Error("Google Drive enthält einen anderen Stand. Synchronisation blockiert.");
  const before=JSON.stringify(state);
  const enc=await cipher.encrypt(state,password(),{vaultId:"nkpro2-main",parentId:remote});
  const r=await drive.uploadEnvelope(enc,remote);
  if(JSON.stringify(state)!==before)throw Error("Daten während Upload geändert.");
  remote=r.fileId;dirty=false;await save();
  status("Verschlüsselte Sicherung in Google Drive erstellt (Version "+r.count+").");
 }
 async function automatic(){
  if(busy||!state||!drive.isConnected()||document.hidden||!remote)return;
  await action(async()=>{if(dirty)await push(false);else{
   const h=await drive.history();if(h.head?.id!==remote)await pull();
  }})();
 }
 function makePanel(){
  document.body.insertAdjacentHTML("beforeend",[
  "<div class='nk-cloud-panel' id='nkSyncPanel' hidden>",
  "<div class='nk-cloud-shade' id='nkShade'></div>",
  "<section class='nk-cloud-card' role='dialog' aria-modal='true' aria-labelledby='nkSyncTitle'>",
  "<header><div><div class='nk-live-eyebrow'>SYSTEMSTATUS · GOOGLE DRIVE</div>",
  "<h2 id='nkSyncTitle'>Synchronisierung & Datensicherung</h2></div>",
  "<button id='nkSyncClose' type='button' aria-label='Schließen'>×</button></header>",
  "<p>Die Cloud ist direkt in NK-Pro 2.0 integriert. Stammdaten und historische Abrechnungen bleiben privat und verschlüsselt.</p>",
  "<label for='nkSyncPassword'>Datenpasswort (mindestens 14 Zeichen)</label>",
  "<input id='nkSyncPassword' type='password' autocomplete='off' minlength='14'>",
  "<div class='nk-live-actions'>",
  "<button type='button' id='nkUnlock' class='secondary'>Lokale Daten öffnen</button>",
  "<button type='button' id='nkConnect'>Google verbinden</button>",
  "<button type='button' id='nkPull' class='secondary'>Aus Google Drive laden</button></div>",
  "<div id='nkSyncCallout' class='nk-cloud-callout' role='status' aria-live='polite' hidden></div>",
  "<div class='nk-cloud-divider'></div><h3>Altdaten direkt aus Google Drive übernehmen</h3>",
  "<p>NK-Pro 2.0 findet deine vorhandenen NK-Pro-1.0-Daten selbst. Es werden nur das Objekt, Wohnungen, Mietverhältnisse, der Zählerstamm und die historischen Archive übernommen. 2025 bleibt vollständig leer.</p>",
  "<div class='nk-live-actions'><button id='nkImportDrive' type='button'>Altdaten direkt aus Drive übernehmen</button></div>",
  "<details class='nk-cloud-manual'><summary>Alternative: Sicherungsdatei manuell auswählen</summary>",
  "<p>Nur nötig, falls Google die ursprünglichen Daten nicht bereitstellt.</p>",
  "<input id='nkSource' type='file' accept='.json,application/json'>",
  "<div class='nk-live-actions'><button id='nkImport' type='button' class='secondary'>Datei prüfen und übernehmen</button></div>",
  "</details>",
  "<div class='nk-cloud-divider'></div><div class='nk-live-actions'>",
  "<button type='button' id='nkPush'>Verschlüsselt in Drive sichern</button>",
  "<button type='button' id='nkBackup' class='secondary'>Sicherungsdatei herunterladen</button></div>",
  "<div id='nkLocalMessage' class='nk-live-muted'></div>",
  "<div id='nkSyncMessage' class='nk-cloud-message' role='status' aria-live='polite'></div>",
  "</section></div>"].join(""));
  $("nkSyncButton").addEventListener("click",()=>{document.body.classList.remove("menu-open");$("nkSyncPanel").hidden=false;
   $("nkSyncPassword").focus();setStatus();});
  for(const id of ["nkSyncClose","nkShade"])$(id).addEventListener("click",()=>{
   $("nkSyncPanel").hidden=true;});
  $("nkImport").addEventListener("click",action(importSource));
  $("nkImportDrive").addEventListener("click",action(importDirectlyFromDrive));
  $("nkUnlock").addEventListener("click",action(unlock));
  $("nkConnect").addEventListener("click",action(connect));
  $("nkPull").addEventListener("click",action(pull));
  $("nkPush").addEventListener("click",action(()=>push(true)));
  $("nkBackup").addEventListener("click",()=>{
   if(revision)download(revision,"NKPro2-Privatdaten-verschluesselt.json");});
 }
 const cell=t=>"<td>"+clean(t)+"</td>";
 const grid=(headers,rows)=>"<div class='nk-live-scroll'><table class='nk-live-table'><thead><tr>"+
  headers.map(t=>"<th>"+clean(t)+"</th>").join("")+"</tr></thead><tbody>"+
  rows.map(row=>"<tr>"+row.map(cell).join("")+"</tr>").join("")+"</tbody></table></div>";
 const metric=(a,b)=>"<div class='nk-live-card'><b>"+clean(a)+"</b><span>"+clean(b)+"</span></div>";
 const archiveButtons=a=>a.map(x=>"<button type='button' class='nk-live-archive' data-nk-view='archive' data-id='"+
  clean(x.id)+"'><span><b>"+clean(x.year)+"</b> · "+(x.completeness==="complete"?
  "Vollständiger Archivstand":"Historischer Teilbestand")+"</span><span>Nur lesen →</span></button>").join("");
 function navigate(next,id){document.body.classList.remove("menu-open");view=next;archiveId=id||null;render();}
 function render(){
  if(!live)return;
  const main=$("appMain"),crumb=$("breadcrumbView"),o=state?.objects?.[0];
  const subtitle=document.querySelector(".brand-subtitle");
  if(subtitle)subtitle.textContent="ECHTDATEN · INTEGRIERTE APP";
  const badge=document.querySelector(".demo-badge");
  if(badge)badge.textContent="ECHTDATEN · 2025 OFFEN";
  const footer=document.querySelector(".app-footer");
  if(footer)footer.textContent="NK-Pro 2.0 · Echtdatenbestand. 2025 wird neu erstellt. Fachliche Endabrechnung noch nicht freigegeben.";
  if($("resetDemo"))$("resetDemo").hidden=true;
  if(!o){
   $("portfolioTree").innerHTML="";crumb.textContent="Datenbestand gesperrt";
   main.innerHTML="<div class='nk-live-page'><h1>Privaten Datenbestand öffnen</h1>"+
     "<p>Der Echtdatenbestand ist verschlüsselt gespeichert. Öffne ihn über den Google-Drive-Button unter Systemstatus.</p>"+
     "<button id='nkOpenLocked' class='nk-live-primary' type='button'>Daten öffnen</button></div>";
   $("nkOpenLocked").addEventListener("click",()=>$("nkSyncButton").click());return;
  }
  const archive=o.archives.slice().sort((a,b)=>b.year.localeCompare(a.year)||a.ordinal-b.ordinal);
  $("portfolioTree").innerHTML="<div class='global-nav-heading'>OBJEKT</div>"+
   "<button type='button' class='nk-live-tree' data-nk-view='overview'>"+clean(o.name)+"</button>"+
   "<div class='nk-live-tree-children'>"+
   ["units|Wohnungen","tenancies|Mietverhältnisse","meters|Zählerstamm",
    "year|Abrechnung 2025 · Neu","archives|Vergangene Jahre"].map(x=>{
      const [name,text]=x.split("|");
      return "<button type='button' data-nk-view='"+name+"'>"+text+"</button>";
    }).join("")+"</div>";
  const intro="<div class='nk-live-eyebrow'>"+clean(o.code)+" · "+clean(o.city)+"</div>";
  let html="",title="Startseite";
  if(view==="overview"||view==="object"){
   title="Objektübersicht";
   html=intro+"<h1>"+clean(o.name)+"</h1><p>"+clean(o.street)+", "+clean(o.postalCode)+" "+clean(o.city)+"</p>"+
    "<div class='nk-live-stats'>"+metric(o.units.length,"Wohnungen")+
    metric(o.tenancies.length,"Mietverhältnisse")+metric(o.meterRegistry.length,"Zähler")+
    metric(archive.length,"Historische Archive")+"</div>"+
    "<section class='nk-live-section'><h2>Abrechnung 2025 – neu erstellen</h2>"+
    "<p>Keine Rechnungsbeträge, Vorauszahlungen oder Wasserstände aus NK-Pro 1.0 übernommen.</p>"+
    "<button class='nk-live-primary' type='button' data-nk-view='year'>2025 öffnen →</button></section>"+
    "<section class='nk-live-section'><h2>Vergangene Jahre</h2>"+archiveButtons(archive)+"</section>";
  }else if(view==="units"){
   title="Wohnungen";html=intro+"<h1>Wohnungen</h1>"+grid(["ID","Bezeichnung","Lage","m²","Status"],
    o.units.map(u=>[u.id,u.label,u.position,number(u.area),u.active?"Aktiv":"Inaktiv"]));
  }else if(view==="tenancies"){
   title="Mietverhältnisse";html=intro+"<h1>Mietverhältnisse</h1>"+
    "<p>M000 ist ein regulärer Abrechnungsteilnehmer. Einzug seit 01.01.2010.</p>"+
    grid(["Mieter-ID","Wohnung","Name","Nutzung","Einzug","Auszug"],
     o.tenancies.map(t=>[t.id,t.unitId,t.name,t.role,t.leaseStart,t.leaseEnd||"–"]));
  }else if(view==="meters"){
   title="Zählerstamm";html=intro+"<h1>Zählerstamm</h1>"+
    "<p>Alle bisherigen Zähleridentitäten. Ablesungen für die neue Abrechnung 2025 werden separat erfasst.</p>"+
    grid(["ID","Wohnung","Art","Nummer","Status"],
     o.meterRegistry.map(m=>[m.id,m.unitId||"Haus",m.type,m.number,m.status]));
  }else if(view==="year"){
   title="Abrechnung 2025";const a=o.annual["2025"];
   html=intro+"<h1>Jahresabrechnung 2025</h1><div class='nk-live-notice'>"+
    "<b>Neuer Abrechnungsstand – keine Altwerte</b>"+
    "<p>Wasser, Techem, Müll, alle Kosten, Zahlungen und Prüfergebnisse aus 2025 sind ausdrücklich nicht migriert worden.</p></div>"+
    "<div class='nk-live-stats'>"+metric(a.costs.length,"Kosten erfasst")+
    metric(Object.keys(a.payments).length,"Zahlungen erfasst")+
    metric(a.meterReadings.length,"Ablesungen erfasst")+"</div>"+
    "<section class='nk-live-section'><h2>Fachworkflow noch in Entwicklung</h2>"+
    "<p>Keine vorgetäuschte Abrechnung, keine fiktiven Nullbeträge und keine voreilige Freigabe.</p></section>";
  }else if(view==="archives"||view==="documents"){
   title="Dokumente & Archiv";html=intro+"<h1>Historische Abrechnungen</h1>"+
    "<p>Alle fünf historischen Original-Snapshots, darunter zwei 2023er Fassungen, sind schreibgeschützt erhalten.</p>"+
    "<section class='nk-live-section'>"+archiveButtons(archive)+"</section>";
  }else if(view==="archive"){
   const a=o.archives.find(x=>x.id===archiveId);
   if(!a){view="archives";render();return;}
   title="Archiv "+a.year;
   const costs=a.snapshot?.data?.kostenarten||[];
   const figures=a.snapshot?.summary||{},calculation=a.snapshot?.calculation||{};
   const results=Array.isArray(calculation.tenantResults)?calculation.tenantResults:[];
   html=intro+"<button type='button' class='nk-live-back' data-nk-view='archives'>← Alle Archive</button>"+
    "<h1>Archiv "+clean(a.year)+"</h1><div class='nk-live-notice'><b>"+
    (a.completeness==="complete"?"Vollständiger Archivstand":"Historischer Teilbestand")+
    "</b><p>Unveränderte Originalwerte, ohne neue Berechnung oder stillschweigende Datenkorrektur.</p></div>"+
    "<div class='nk-live-stats'>"+metric(eur(figures.kostenNK),"Historische Kosten laut Quelle")+
    metric(eur(figures.vorauszahlungen),"Vorauszahlungen laut Quelle")+
    metric(eur(figures.saldo),"Saldo laut Quelle")+metric(results.length,"Originale Teilnehmerergebnisse")+"</div>"+
    (results.length?"<section class='nk-live-section'><h2>Originale Einzelabrechnungsergebnisse</h2>"+
     grid(["Mietverhältnis","Kostenanteil","Vorauszahlungen","Saldo"],
      results.map(r=>[r.tenant?.name||r.tenant?.id||"–",eur(r.costShare),
       eur(r.prepayments),eur(r.balance)]))+"</section>":"")+
    "<section class='nk-live-section'><h2>Historische Kostenarten</h2>"+
    grid(["Kennung","Originalbezeichnung","Originalbetrag"],
    costs.map(c=>[c.id,c.kostenart,eur(c.gesamtbetrag)]))+"</section>";
  }else if(view==="analytics"){
   title="Analysen";html=intro+"<h1>Analysen</h1><div class='nk-live-notice'>"+
    "<b>Historische Archive übernommen</b><p>Finanz-, Steuer- und Nebenkostenanalysen dürfen erst nach geprüfter Fachparität berechnet werden.</p></div>";
  }
  crumb.textContent=title;
  main.innerHTML="<div class='nk-live-page'>"+html+"</div>";
  for(const root of [main,$("portfolioTree")])for(const el of root.querySelectorAll("[data-nk-view]"))
   el.addEventListener("click",()=>navigate(el.dataset.nkView,el.dataset.id));
  for(const el of document.querySelectorAll(".nav-item[data-view]"))
   el.classList.toggle("active",el.dataset.view===view);
  setStatus();
 }
 function bootstrap(){
  if(started)return live;started=true;live=!!revision;
  makePanel();setStatus();
  const previous=sessionStorage.getItem("nkpro2_imported_message");
  if(previous){sessionStorage.removeItem("nkpro2_imported_message");status(previous); }
  if(live){
   for(const el of document.querySelectorAll(".nav-item[data-view]"))
    el.addEventListener("click",()=>navigate(el.dataset.view==="overview"?"overview":
      el.dataset.view==="analytics"?"analytics":"documents"));
   const menu=$("openMenu");
   if(menu)menu.addEventListener("click",()=>document.body.classList.toggle("menu-open"));
   document.addEventListener("click",e=>{
    if(document.body.classList.contains("menu-open")&&
     !e.target.closest("#sidebar")&&!e.target.closest("#openMenu"))
      document.body.classList.remove("menu-open");
   });
   document.addEventListener("keydown",e=>{if(e.key==="Escape"){
    document.body.classList.remove("menu-open");$("nkSyncPanel").hidden=true;
   }});
   render();
  }
  if("serviceWorker" in navigator){
   // Retire only the superseded /NK-Pro-2.0/private/ offline shell.
   // Do not touch NK-Pro 1.0 workers, personal local data or encrypted snapshots.
   navigator.serviceWorker.getRegistrations().then(regs=>Promise.all(
    regs.filter(r=>new URL(r.scope).pathname==="/NK-Pro-2.0/private/")
     .map(r=>r.unregister()))).catch(()=>{});
   navigator.serviceWorker.register("./nkpro2-sw.js",{scope:"./"})
    .catch(e=>status("Offline-App konnte nicht eingerichtet werden: "+e.message,true));
  }
  setInterval(()=>automatic().catch(e=>status(String(e.message||e),true)),45000);
  window.addEventListener("focus",()=>automatic().catch(e=>status(String(e.message||e),true)));
  return live;
 }
 window.NKPRO2_INTEGRATED_APP=Object.freeze({bootstrap,hasLocalData:()=>!!localStorage.getItem(KEY)});
})();