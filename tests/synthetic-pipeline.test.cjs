"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const runner=require("../experimental/synthetic-pipeline.js");
const ext=require("../experimental/external-techem.js");
function fixture(){
 const ids=Array.from({length:7},(_,i)=>"LAB-U"+(i+1));
 const units=ids.map((id,i)=>({id,bezeichnung:"Musterobjekt "+(i+1),
   wohnflaeche:50+i*4,status:"aktiv"}));
 const tenants=ids.slice(0,6).map((id,i)=>({
   id:i===0?"LAB-M0":"LAB-M"+i,wohnung:id,
   name:"Muster "+i,einzug:"2025-01-01",auszug:"2025-12-31",
   abrechnungRolle:i===0?"Privatanteil":"Mieter"
 }));
 const state={
   meta:{dataSchemaVersion:5,abrechnungsjahr:"2025",abrechnungsbeginn:"2025-01-01",
     abrechnungsende:"2025-12-31",
     confirmed2025Evidence:{water:{houseConsumption:275,readingDate:"2025-12-30"}}},
   wohnungen:units,mieter:tenants,kostenarten:[
     {id:"K002",kostenart:"Wasser",gesamtbetrag:1642.31,inNK:"Ja",umlageschluessel:"Verbrauch"},
     {id:"K006",kostenart:"Heizkosten",gesamtbetrag:653.88,inNK:"Ja",
       umlageschluessel:"Manuelle Eingabe je Mieter/Wohneinheit",berechnungsart:"Manuell je Mieter"}
   ],
   waterMeters:{settings:{houseWaterTotal:275},readings:ids.map((id,i)=>{
     const used=[30,40,35,50,45,35,40][i];
     return{meterId:"LAB-Z"+i,kwStart:100+i*2,kwEnd:100+i*2+used-10,
       wwStart:200+i*2,wwEnd:210+i*2};
   })},
   umlageInputs:{K006:{mode:"Externe Einzelabrechnung",
      externalBilling:{includedOwnerShare:3.88},caseValues:{}}}
 };
 const input={fixtureKind:"synthetic",legacy:{fixtureKind:"synthetic",
     providerCostId:"K006",state},letterBundle:null};
 const provider={
   period:{start:"2025-01-01",end:"2025-12-31"},
   units:units.map(x=>({id:x.id})),
   tenants:tenants.map(x=>({id:x.id,unitId:x.wohnung,start:x.einzug,end:x.auszug,private:x.abrechnungRolle==="Privatanteil"})),
   cost:{id:"K006",amount:653.88,method:"Externe Einzelabrechnung"},values:{},externalOwnerShare:3.88
 };
 const cases=ext.deriveCases(provider);
 for(const c of cases)state.umlageInputs.K006.caseValues[c.caseKey]={amount:c.role==="vacancy"?50:100};
 input.letterBundle={fixtureKind:"synthetic",
   letters:tenants.map(t=>({
     fixtureKind:"synthetic",
     period:{start:"2025-01-01",end:"2025-12-31"},
     tenant:{id:t.id,name:t.name,street:"Beispielallee 10",postalCode:"60000",city:"Musterdorf"},
     settings:{senderName:"Mustereigentümer",letterDate:"2026-11-22",
       signature:"Demo",bankAccount:"TEST-IBAN"},
     rows:[{costId:"K006",name:"Heizkosten",shareCents:10000,prepaymentCents:9000}],
     settlement:{costShareCents:10000,prepaymentsCents:9000,correctionCents:0}
   }))
 };
 return input;
}
test("integrates 7 synthetic units, private participant, K002, Techem and 44 QA states",()=>{
 const r=runner.run(fixture());
 assert.equal(r.kind,"synthetic-integration-report");
 assert.equal(r.counts.units,7);assert.equal(r.counts.participants,6);
 assert.equal(r.counts.qualityRules,44);
 assert.equal(r.counts.qualitySubsetExecuted,10);
 assert.equal(r.counts.qualityRulesNotRun,34);
 assert.equal(r.counts.critical,0);assert.equal(r.counts.openDecisions,0);
 assert.equal(r.sections.water.house,275);
 assert.equal(r.sections.water.units,275);
 assert.ok(Math.abs(r.sections.provider.ownerShare-53.88)<1e-8);
 assert.equal(r.sections.provider.externalOwnerShare,3.88);
 assert.equal(r.sections.documents.dataReady,true);
 assert.equal(r.experimentalSubsetClear,true);
 assert.equal(r.readyForRealFinalization,false);
 assert.equal(r.sections.documents.readyForPrint,false);
});
test("missing document for private participant is a critical issue",()=>{
 const s=fixture();s.letterBundle.letters=s.letterBundle.letters.filter(x=>x.tenant.id!=="LAB-M0");
 const r=runner.run(s);
 assert.ok(r.findings.some(x=>x.code==="MISSING_RECIPIENT_LETTER"&&x.sourceId==="LAB-M0"));
 assert.equal(r.experimentalSubsetClear,false);
});
test("existing source data is not mutated by orchestration",()=>{
 const s=fixture(),before=JSON.stringify(s);
 runner.run(s);
 assert.equal(JSON.stringify(s),before);
});
test("source never leaks contacts or unrelated authentication metadata into diagnostics",()=>{
 const s=fixture();
 s.legacy.state.mieter[0].email="syntheticprivate@test.invalid";
 s.legacy.state.meta.authToken="DO-NOT-COPY-TEST";
 const r=runner.run(s),text=JSON.stringify(r);
 assert.equal(text.includes("syntheticprivate@test.invalid"),false);
 assert.equal(text.includes("DO-NOT-COPY-TEST"),false);
});
test("single changed meter must invalidate a previously accepted difference decision",()=>{
 const s=fixture();
 s.legacy.state.waterMeters.readings[0].kwEnd-=1;
 const a=runner.run(s),issue=a.findings.find(x=>x.code==="WATER_HOUSE_UNITS_DIFFERENCE");
 assert.ok(issue);assert.equal(issue.severity,"decision");
 const decision={[issue.code]:{signature:issue.signature,reason:"Die Wasserabweichung ist fachlich bestätigt."}};
 assert.equal(runner.run(s,{decisions:decision}).counts.acceptedDecisions,1);
 s.legacy.state.waterMeters.readings[0].kwEnd-=1;
 s.legacy.state.waterMeters.readings[1].kwEnd+=1;
 const b=runner.run(s,{decisions:decision});
 assert.equal(b.sections.water.gap,1);
 assert.equal(b.counts.acceptedDecisions,0);
 assert.equal(b.counts.openDecisions,1);
});
test("critical data defects cannot be overridden with a review decision",()=>{
 const s=fixture();s.legacy.state.waterMeters.readings[0].kwEnd="";
 const r=runner.run(s);
 assert.ok(r.counts.critical>0);
 const fakeDecisions=Object.fromEntries(r.findings.map(x=>[
   x.code,{signature:x.signature,reason:"Forced acceptance of a critical error"}]));
 const checked=runner.run(s,{decisions:fakeDecisions});
 assert.ok(checked.counts.critical>0);
 assert.equal(checked.readyForRealFinalization,false);
});
test("unverified schema and canonical meter readings are explicitly blocked",()=>{
 const s=fixture();
 s.legacy.state.meta.dataSchemaVersion=6;
 s.legacy.state.zaehlerDaten={zaehler:[{}],messperioden:[]};
 const r=runner.run(s);
 assert.ok(r.findings.some(x=>x.code==="UNSUPPORTED_SCHEMA_VERSION"));
 assert.ok(r.findings.some(x=>x.code==="CANONICAL_METER_PERIODS_NOT_YET_MAPPED"));
});
test("private occupancy remains participant in fully synthetic provider calculation",()=>{
 const s=fixture(),r=runner.run(s);
 assert.equal(r.counts.participants,6);
 assert.equal(r.sections.provider.errorCount,0);
 assert.equal(r.sections.documents.expected,6);
});
test("missing provider is visible and not converted into an empty successful provider",()=>{
 const s=fixture();delete s.legacy.providerCostId;
 const r=runner.run(s);
 assert.ok(r.findings.some(x=>x.code==="EXTERNAL_SOURCE_MISSING"));
 assert.equal(r.experimentalSubsetClear,false);
});
test("untagged production-like data rejected",()=>{
 const s=fixture();delete s.legacy.fixtureKind;
 assert.throws(()=>runner.run(s),/Synthetic-only/);
});
test("letter cents mismatch is a blocking critical finding",()=>{
 const s=fixture();
 s.letterBundle.letters[0].rows[0].shareCents-=1;
 const r=runner.run(s);
 assert.ok(r.findings.some(x=>x.code==="LETTER_COST_MISMATCH"));
 assert.equal(r.sections.documents.dataReady,false);
});
test("no document bundle can never be described as a ready billing document",()=>{
 const s=fixture();delete s.letterBundle;
 const r=runner.run(s);
 assert.ok(r.findings.some(x=>x.code==="LETTERS_NOT_PROVIDED"));
 assert.equal(r.sections.documents.readyForPrint,false);
});
