"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const adapter=require("../experimental/legacy-fixture-bridge.js");
const quality=require("../experimental/quality-contract.js");
const external=require("../experimental/external-techem.js");
const water=require("../experimental/water-2025.js");
function synthetic(){
 const units=Array.from({length:7},(_,i)=>({
   id:"DEMO-U"+i,bezeichnung:"Wohnung "+i,wohnflaeche:50+i,status:"aktiv"
 }));
 const tenants=units.map((u,i)=>({id:"DEMO-T"+i,wohnung:u.id,
   name:"Musterbelegung "+i,einzug:"2025-01-01",auszug:"2025-12-31",
   abrechnungRolle:i===0?"Privatanteil":"Mieter"}));
 const src={
  meta:{dataSchemaVersion:5,abrechnungsjahr:"2025",
   abrechnungsbeginn:"2025-01-01",abrechnungsende:"2025-12-31",
   confirmed2025Evidence:{water:{houseConsumption:275,readingDate:"2025-12-30"}}},
  wohnungen:units,mieter:tenants,kostenarten:[
   {id:"K002",kostenart:"Wasser",inNK:"Ja",gesamtbetrag:1642.31,umlageschluessel:"Verbrauch"},
   {id:"K006",kostenart:"Techem",inNK:"Ja",gesamtbetrag:703.88,
    umlageschluessel:"Manuelle Eingabe je Mieter/Wohneinheit",berechnungsart:"Manuell je Mieter"}
  ],
  waterMeters:{settings:{houseWaterTotal:275},readings:units.map((u,i)=>({
   meterId:"DEMOMETER-"+i,kwStart:100+i,kwEnd:130+i,
   wwStart:200+i,wwEnd:209+i+(i===0?5:0)
  }))},
  umlageInputs:{K006:{mode:"Externe Einzelabrechnung",
   externalBilling:{includedOwnerShare:3.88},caseValues:{}}}
 };
 const input={fixtureKind:"synthetic",providerCostId:"K006",state:src};
 return input;
}
function fillProvider(src){
 const preview=adapter.project(src);
 const cases=external.deriveCases(preview.normalized.providerInput);
 for(const c of cases){
   src.state.umlageInputs.K006.caseValues[c.caseKey]={amount:c.role==="vacancy"?0:100,source:"synthetic"};
 }
}
test("schema-5 adapter projects 7 units, 7 normal participants including private",()=>{
 const s=synthetic(),p=adapter.project(s);
 assert.equal(p.counts.units,7);
 assert.equal(p.counts.tenants,7);
 assert.equal(p.normalized.tenants.filter(t=>t.private).length,1);
 assert.equal(p.normalized.qualityInput.tenants[0].private,true);
 assert.equal(p.normalized.costs[0].amount,1642.31);
 assert.equal(p.migrationPermitted,false);
 assert.equal(p.readyForRealFinalization,false);
});
test("schema-5 contract preview drives the quality engine without mutating source",()=>{
 const s=synthetic(),before=JSON.stringify(s);
 const p=adapter.project(s);
 const q=quality.evaluateEarly(p.normalized.qualityInput);
 assert.equal(q.counts.critical,0);
 assert.equal(q.counts.experimental,7);
 assert.equal(q.counts.notRun,37);
 assert.equal(q.readyForRealFinalization,false);
 assert.equal(JSON.stringify(s),before);
});
test("the legacy input is mapped to external Techem case values with source basis preserved",()=>{
 const s=synthetic();fillProvider(s);
 const p=adapter.project(s),r=external.calculateExternal(p.normalized.providerInput);
 assert.equal(r.externalOwnerShare,3.88);
 assert.equal(r.allocations["DEMO-T0"],100);
 assert.ok(Math.abs(r.unclassifiedOwnerShare)<1e-7);
 assert.equal(r.ownerShare,3.88);
 assert.equal(p.issues.length,0);
});
test("2025 water adapter preserves original confirmed data without silently spreading house difference",()=>{
 const s=synthetic(),p=adapter.project(s);
 const diag=water.diagnostics(p.normalized.waterData);
 assert.equal(diag.house,275);
 assert.equal(diag.units,7*39+5);
 assert.ok(diag.issues.some(x=>x.code==="HOUSE_UNITS_DIFFERENCE"));
 assert.equal(diag.unallocatedGap,-3);
});
test("missing original area or invalid unit identity produces controlled migration issues",()=>{
 const s=synthetic();s.state.wohnungen[0].wohnflaeche=0;
 s.state.mieter[0].wohnung="not-a-real-unit";
 const p=adapter.project(s);
 assert.ok(p.issues.some(x=>x.code==="UNCONFIRMED_UNIT_AREA"));
 assert.ok(p.issues.some(x=>x.code==="INVALID_UNIT_REFERENCE"));
 assert.equal(p.migrationPermitted,false);
});
test("canonical periods and ambiguity are explicitly not silently migrated",()=>{
 const s=synthetic();
 s.state.zaehlerDaten={zaehler:[{meterId:"Z-1"}],messperioden:[]};
 s.state.waterMeters.readings[1].meterId=s.state.waterMeters.readings[0].meterId;
 const p=adapter.project(s);
 assert.ok(p.issues.some(x=>x.code==="CANONICAL_METER_PERIODS_NOT_YET_MAPPED"));
 assert.ok(p.issues.some(x=>x.code==="METER_IDENTITY_UNVERIFIED"));
});
test("missing provider individual data remains an issue for the provider, not an invented zero",()=>{
 const s=synthetic();
 const p=adapter.project(s),r=external.calculateExternal(p.normalized.providerInput);
 assert.ok(r.issues.some(x=>x.code==="OPEN_CASE"));
 assert.equal(r.readyForDemoReview,false);
});
test("unknown confidential fields never leak into projection",()=>{
 const s=synthetic();
 s.state.mieter[0].email="sentinel@example.invalid";
 s.state.mieter[0].telefon="TEST-PHONE-NOT-REAL";
 s.state.meta.oauthToken="SECRET-TEST-STRING";
 const p=adapter.project(s),out=JSON.stringify(p);
 assert.ok(!out.includes("sentinel@example.invalid"));
 assert.ok(!out.includes("TEST-PHONE-NOT-REAL"));
 assert.ok(!out.includes("SECRET-TEST-STRING"));
});
test("non synthetic input rejected and original state not mutated",()=>{
 const s=synthetic(),before=JSON.stringify(s);
 adapter.project(s);
 assert.equal(JSON.stringify(s),before);
 delete s.fixtureKind;
 assert.throws(()=>adapter.project(s),/synthetic/);
});
test("unknown schema or missing period does not get defaulted",()=>{
 const s=synthetic();s.state.meta.dataSchemaVersion=6;
 s.state.meta.abrechnungsbeginn="";
 const p=adapter.project(s);
 assert.ok(p.issues.some(x=>x.code==="UNSUPPORTED_SCHEMA_VERSION"));
 assert.ok(p.issues.some(x=>x.code==="INCOMPLETE_BILLING_PERIOD"));
});
