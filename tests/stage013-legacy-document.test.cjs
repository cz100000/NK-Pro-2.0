"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const letter=require("../legacy-letter-engine.js"),
  landlord=require("../legacy-landlord-documents.js"),
  workspace=require("../letter-workspace-ui.js");
const annual=()=>({
 fixture:true,period:"2025",property:{name:"Musterobjekt A",
   street:"Beispielstraße 1",postalCode:"00000",city:"Musterstadt"},
 units:[{id:"W1",label:"Wohnung A",area:57},{id:"W2",label:"Wohnung B",area:61}],
 tenancies:[
  {id:"T1",unitId:"W1",name:"Musterperson A",firstName:"Muster",lastName:"A",
   salutation:"Herr",role:"Mieter",recipientStreet:"Musterstraße 9",
   recipientPostalCode:"00000",recipientCity:"Musterstadt"},
  {id:"M000",unitId:"W2",name:"Musterperson B",role:"Privatanteil",
   recipientStreet:"Musterweg 2",recipientPostalCode:"00001",recipientCity:"Teststadt"}],
 costs:[{id:"water",sourceId:"K002",name:"Wasserversorgung",amount:250,active:true},
   {id:"heat",sourceId:"K006",name:"Heizung und Warmwasser",amount:310,active:true}],
 letterSettings:{senderName:"Demo-Vermieterin",senderStreet:"Beispielweg 1",
  senderCity:"00000 Musterstadt",letterDate:"2026-11-22",
  paymentDue:"2026-12-09",signature:"Muster-Vermieterin",
  bankAccount:"TEST-IBAN",saldoTextNachzahlung:
   "Bitte überweisen Sie den Betrag von {betrag} bis zum {zahlungsziel} auf das Ihnen bekannte Konto."}
});
const calc=()=>({
 valid:true,
 tenants:[
  {id:"T1",unitId:"W1",name:"Musterperson A",role:"Mieter",
    costCents:17100,advanceCents:7000,balanceCents:10100},
  {id:"M000",unitId:"W2",name:"Musterperson B",role:"Privatanteil",
    costCents:38900,advanceCents:44000,balanceCents:-5100}],
 costs:[
  {id:"water",name:"Wasserversorgung",grossCents:25000,eligibleCents:25000,
   method:"Verbrauch",consumptionTotal:100,price:{effective:2.5},notAllocatedCents:0,
   rows:[{tenantId:"T1",cents:8000,weight:35,totalWeight:100},
         {tenantId:"M000",cents:17000,weight:65,totalWeight:100}]},
  {id:"heat",name:"Heizung und Warmwasser",grossCents:31000,eligibleCents:31000,
   method:"Externe Einzelabrechnung",notAllocatedCents:0,
   rows:[{tenantId:"T1",cents:9100,weight:null,totalWeight:null},
         {tenantId:"M000",cents:21900,weight:null,totalWeight:null}]}],
 totals:{grossCostsCents:56000,distributedCents:56000,advancesCents:51000,balanceCents:5000}
});
test("0.13 preserves original exact AP13 DIN-A4 markup and nine-column cost table",()=>{
 const original=fs.readFileSync(path.join(__dirname,"..","legacy-letter-engine.js"),"utf8");
 assert.match(original,/Source: cz100000\/NK-Pro\/js\/document-renderer\.js/);
 assert.match(original,/@page\{size:A4;margin:0\}/);
 assert.match(original,/\.letter-sheet\{position:relative;width:210mm;height:297mm/);
 assert.match(original,/<colgroup><col class="col-cost">/);
 assert.match(original,/Ihre<br>Vorauszahlung/);
 const a=annual(),snapshot=JSON.stringify(a);
 const r=letter.render(a,calc(),"T1");
 assert.equal(JSON.stringify(a),snapshot,"Letter preview must never change the annual data");
 assert.match(r.html,/class="nk-letter-document"/);
 assert.match(r.html,/letter-main-sheet/);
 assert.match(r.html,/data-document-pages="1"/);
 assert.match(r.html,/Abrechnungsübersicht im Detail/);
 assert.match(r.html,/Musterperson A/);
 assert.match(r.html,/101,00/);
 assert.match(r.html,/70,00/);
 assert.equal(r.costCents,17100);
 assert.equal(r.advanceCents,7000);
 assert.equal(r.balanceCents,10100);
 assert.equal(r.pageCount,1);
 assert.equal(r.preflight.errors,0);
 assert.equal(r.preflight.readyForRealFinalization,false);
});
test("0.13 synthetic print is watermarked but preserves exact A4 source geometry",()=>{
 const html=letter.render(annual(),calc(),"T1").html;
 const print=letter.printHtml(html,"Musterbrief");
 assert.match(print,/MUSTER – NICHT VERSENDEN/);
 assert.match(print,/width:210mm;height:297mm/);
 assert.match(print,/Druck/); // Source print title and guide
});
test("0.13 monthly prepayment adjustments and extra notes create optional original page 2",()=>{
 const a=annual();
 a.letterSettings.vorauszahlungPrintMode="Manuelle Werte drucken";
 a.letterSettings.prepaymentRows=[{tenantId:"T1",costId:"water",label:"Wasser",
   oldMonthly:15,newMonthly:21}];
 const r=letter.render(a,calc(),"T1");
 assert.equal(r.pageCount,2);
 assert.ok(r.preflight.errors>0,"Without verified base rent, the optional warm-rent adjustment may be previewed but cannot be printed.");
 assert.match(r.html,/letter-supplement-sheet/);
 assert.match(r.html,/Anpassung der Nebenkostenvorauszahlung/);
 assert.match(r.html,/Neuer Betrag/);
 a.letterSettings.vorauszahlungPrintMode="Nicht drucken";
 a.letterSettings.prepaymentRows=[];
 a.letterSettings.outroText="Zusätzliche Abrechnungserläuterung";
 assert.equal(letter.render(a,calc(),"T1").pageCount,2);
});
test("0.13 private-role tenancy gets complete independent document, zero special billing exemption",()=>{
 const r=letter.render(annual(),calc(),"M000");
 assert.equal(r.balanceCents,-5100);
 assert.match(r.html,/Guthaben/);
 assert.match(r.html,/Musterperson B/);
 assert.match(r.html,/letter-main-sheet/);
 assert.equal(r.preflight.errors,0);
 assert.equal(letter.renderAll(annual(),calc()).length,2);
});
test("0.13 missing recipient address blocks print preflight, not draft preview",()=>{
 const a=annual();a.tenancies[0].recipientStreet="";
 const r=letter.render(a,calc(),"T1");
 assert.ok(r.html.length>3000);
 assert.ok(r.preflight.errors>0);
 assert.equal(r.preflight.readyForPrint,false);
});
test("0.13 internal landlord original A4 overview, individual tenant sheet, and combined dossier",()=>{
 const a=annual(),l=calc();
 const model=landlord.buildModel(a,l);
 assert.equal(model.records.length,2);
 assert.equal(model.privateRecords.length,1);
 assert.equal(model.regular.length,1);
 assert.equal(model.allCosts,560);
 assert.equal(model.totalAdvances,70);
 const overview=landlord.render(a,l,"overview");
 assert.match(overview.html,/Objekt-Gesamtübersicht/);
 assert.match(overview.html,/width:210mm;height:297mm/);
 const unit=landlord.render(a,l,"unit","M000");
 assert.match(unit.html,/Musterperson B/);
 assert.match(unit.html,/Wohnungs-Abrechnungsblatt/);
 const all=landlord.render(a,l,"all");
 assert.equal((all.html.match(/class="nk-internal-sheet"/g)||[]).length,3);
 assert.match(all.html,/FACHTEST – MUSTER/);
});
test("0.13 letter workspace has three panes, original A4 preview, document controls and no new storage",()=>{
 const a=annual(),r=workspace.render({data:a,ledger:calc(),engine:letter,
   ui:{letterId:"T1",letterZoom:.66},annualLocked:false});
 for(const phrase of ["letter-list-panel","letter-preview-panel","letter-settings-panel",
    "letterConfigForm","legacyLetterCanvas","Abrechnungsübersicht im Detail",
    "letter-print-all","letter-internal-unit","letter-fit-page","vorauszahlungPrintMode"])
  assert.ok(r.includes(phrase),"Missing letter workspace surface: "+phrase);
 assert.match(r,/data-id="M000"/);
 const locked=workspace.render({data:a,ledger:calc(),engine:letter,
   ui:{letterId:"M000"},annualLocked:true});
 assert.match(locked,/disabled>Änderungen speichern/);
});
