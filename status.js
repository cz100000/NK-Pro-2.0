"use strict";
(function(){
 const $=id=>document.getElementById(id);
 const set=(id,value)=>{$(id).textContent=String(value);};
 const gateNames={
  realBilling:"Nebenkostenabrechnung mit Echtdaten",
  realDataImport:"Sichere Übernahme der Bestandsdaten",
  all44Rules:"Originalgetreue Ausführung aller 44 Regeln",
  printPdf:"Druckfähige A4-Briefe und PDF-Prüfung",
  archive:"Abschluss und unveränderliches Archiv",
  separateOrigin:"Getrennter Browser-Speicher / Hosting-Origin"
 };
 function badge(name){
  const badge=document.createElement("span");
  badge.className="status "+(name==="Design-Demo"?"neutral":name==="Offen"?"red":"amber");
  badge.textContent=name;return badge;
 }
 async function render(){
  try{
   const response=await fetch("./status.json",{cache:"no-store"});
   if(!response.ok)throw new Error("Status file unavailable");
   const data=await response.json();
   if(data.schemaVersion!==1||!Array.isArray(data.features))throw new Error("Invalid status format");
   set("testCount",data.tests.passed+" / "+data.tests.total);
   set("testResult",data.tests.failed===0?"Automatisierte Tests bestanden":"Tests fehlgeschlagen");
   set("rulesCount",data.inventory.qualityRules);
   set("runRulesCount",data.inventory.experimentalQualityRules);
   set("notRunCount",data.inventory.notPortedRules+" Regeln derzeit nicht portiert");
   set("revision",data.revision==="unknown"?"Revision nicht verfügbar":"Revision "+data.revision.slice(0,12));
   const list=$("moduleRows");list.replaceChildren();
   for(const [title,state,description] of data.features){
    const row=document.createElement("div");row.className="report-line";
    const copy=document.createElement("div");
    const heading=document.createElement("strong");heading.textContent=title;
    const detail=document.createElement("p");detail.textContent=description;
    copy.append(heading,detail);
    row.append(copy,badge(state));list.append(row);
   }
   const gates=$("gateRows");gates.replaceChildren();
   for(const [id,label] of Object.entries(gateNames)){
    const row=document.createElement("div");row.className="report-gate";
    const name=document.createElement("span");name.textContent=label;
    const status=document.createElement("strong");
    status.textContent=data.gates?.[id]?"Bestanden":"Offen";
    row.append(name,status);gates.append(row);
   }
  }catch(_){
   set("testResult","Teststand derzeit nicht abrufbar");
   $("moduleRows").textContent="Die Statusdatei konnte nicht geladen werden. Die Testergebnisse sind weiterhin im GitHub-Repository einsehbar.";
  }
 }
 render();
})();
