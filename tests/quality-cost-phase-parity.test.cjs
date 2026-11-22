"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const quality=require("../experimental/quality-contract.js");
const costs=require("../experimental/quality-cost-phase.js");
const bridge=require("../experimental/legacy-fixture-bridge.js");
const original=fs.readFileSync(path.join(__dirname,"reference","quality-rules-v99.4.86.js"),"utf8");
const marker="  global.NKProQualityRules=Object.freeze(";
assert.equal(original.split(marker).length,2);
const instrumented=original.replace(marker,
  "  global.__COST_PARITY_TEST_ONLY={evaluateFactual,evaluateCosts};\n"+marker);
const ids=["NKP-FACH-008","NKP-FACH-009","NKP-FACH-010"];
function fixture(){
 return{
  fixtureKind:"synthetic",
  period:{year:"2025",start:"2025-01-01",end:"2025-12-31"},
  units:[{id:"TEST-U1",status:"aktiv"},{id:"TEST-U2",status:"aktiv"}],
  tenants:[
   {id:"TEST-M1",name:"Testmieter",unitId:"TEST-U1",start:"2025-01-01",
    end:"2025-12-31",people:2},
   {id:"TEST-M0",name:"Test Privatanteil",unitId:"TEST-U2",start:"2010-01-01",
    end:"",private:true,people:1}
  ],
  costs:[{id:"K-TEST",name:"Musterkosten",enabled:true,amount:250.25,basis:"Wohnfläche"}]
 };
}
function oldResults(model){
 const state={
  meta:{abrechnungsjahr:model.period.year,abrechnungsbeginn:model.period.start,
    abrechnungsende:model.period.end},
  wohnungen:model.units.map(u=>({id:u.id,status:u.status,wohnflaeche:60})),
  mieter:model.tenants.map((t,i)=>({id:t.id,name:t.name,wohnung:t.unitId,
    einzug:t.start,auszug:t.end,personen:t.people,aktiveTage:365,originalIndex:i,
    abrechnungRolle:t.private?"Privatanteil":"Mieter"})),
  kostenarten:model.costs.map(c=>({id:c.id,kostenart:c.name,
    inNK:c.enabled?"Ja":"Nein",gesamtbetrag:c.amount,
    umlageschluessel:c.basis})),
  umlageInputs:{},jahresArchiv:[]
 };
 const env={state};
 env.visibleTenantRows=()=>state.mieter;
 env.billableTenantRows=()=>state.mieter;
 env.privateTenantRows=()=>state.mieter.filter(t=>t.abrechnungRolle==="Privatanteil");
 env.periodStart=()=>state.meta.abrechnungsbeginn;
 env.periodEnd=()=>state.meta.abrechnungsende;
 env.tenantRelevantForCurrentBilling=()=>true;
 const ctx=vm.createContext(env);
 vm.runInContext(instrumented,ctx,{filename:"quality-rules-v99.4.86.js",timeout:3000});
 const factual=ctx.__COST_PARITY_TEST_ONLY.evaluateFactual(state);
 const cost=ctx.__COST_PARITY_TEST_ONLY.evaluateCosts(state,factual);
 return JSON.parse(JSON.stringify([...factual.results,...cost.results]));
}
function compare(model,scenario){
 const before=JSON.stringify(model);
 const originalRows=oldResults(model);
 const fresh=quality.evaluateEarly(model);
 for(const id of ids){
  const rows=originalRows.filter(r=>r.ruleId===id);
  assert.ok(rows.length>0,scenario+": original missing "+id);
  const newRow=fresh.rows.find(r=>r.ruleId===id);
  assert.equal(newRow.execution,"experimental-reference-compared");
  const oldStatus=rows.some(r=>r.status==="Kritischer Abrechnungsmangel")?"critical":
    rows.every(r=>r.status==="Nicht anwendbar")?"not-applicable":"passed";
  assert.equal(newRow.status,oldStatus,scenario+": "+id);
  assert.equal(newRow.findings.length,oldStatus==="critical"?
    rows.filter(r=>r.status==="Kritischer Abrechnungsmangel").length:0,
    scenario+": finding-count "+id);
 }
 assert.equal(fresh.counts.notRun,34);
 assert.equal(fresh.readyForRealFinalization,false);
 assert.equal(JSON.stringify(model),before,"must not mutate input");
}
test("critical person and cost rules match executable V99.4.86 across synthetic cases",()=>{
 const scenarios=[
  ["base",()=>{}],
  ["person key",f=>{f.costs[0].basis="Personentage";}],
  ["missing persons for private occupant",f=>{f.costs[0].basis="Personen";f.tenants[1].people=0;}],
  ["both persons missing",f=>{f.costs[0].basis="Personen";f.tenants.forEach(t=>t.people=null);}],
  ["cost amount zero",f=>{f.costs[0].amount=0;}],
  ["cost amount negative",f=>{f.costs[0].amount=-1;}],
  ["cost amount invalid",f=>{f.costs[0].amount="not-a-number";}],
  ["cost amount comma decimal",f=>{f.costs[0].amount="0,01";}],
  ["cost description absent",f=>{f.costs[0].name="";}],
  ["cost disabled",f=>{f.costs[0].enabled=false;}],
  ["zero costs",f=>{f.costs=[];}],
  ["mixed active and inactive",f=>{
    f.costs.push({id:"K-BAD",name:"Nicht aktiv",enabled:false,amount:0,basis:"Personen"});
  }],
  ["two cost errors",f=>{
    f.costs.push({id:"K-ZERO",name:"Nullbetrag",enabled:true,amount:0,basis:"Wohnfläche"});
    f.costs[0].amount="";
  }]
 ];
 for(const [name,apply] of scenarios){const f=fixture();apply(f);compare(f,name);}
});
test("without cost-domain projection existing seven checks run, three new remain not-run",()=>{
 const f=fixture();delete f.costs;
 const r=quality.evaluateEarly(f);
 assert.equal(r.counts.experimental,7);
 assert.equal(r.counts.notRun,37);
});
test("no consent or missing person count can bypass critical cost rules",()=>{
 const f=fixture();f.costs[0].basis="Personen";f.tenants[1].people=0;
 const r=quality.evaluateEarly(f);
 const x=r.rows.find(t=>t.ruleId==="NKP-FACH-008");
 assert.equal(x.status,"critical");
 assert.equal(x.confirmAllowed,false);
 assert.equal(x.findings[0].id,"TEST-M0");
});
test("cost runner rejects actual/untagged data and cannot mutate input",()=>{
 const f=fixture(),snapshot=JSON.stringify(f);
 const r=costs.evaluate({fixtureKind:"synthetic",costs:f.costs,tenants:f.tenants});
 assert.equal(r.length,3);
 assert.equal(JSON.stringify(f),snapshot);
 assert.throws(()=>costs.evaluate({costs:f.costs,tenants:f.tenants}),/Synthetic-only/);
 assert.throws(()=>costs.evaluate({fixtureKind:"synthetic",costs:null,tenants:f.tenants}),/Synthetic-only/);
});
test("schema-5 synthetic bridge maps persons and active costs for critical runtime checks",()=>{
 const f=fixture();
 const legacy={fixtureKind:"synthetic",state:{
   meta:{dataSchemaVersion:5,abrechnungsjahr:"2025",abrechnungsbeginn:"2025-01-01",
     abrechnungsende:"2025-12-31"},
   wohnungen:f.units.map(u=>({id:u.id,status:u.status,wohnflaeche:60})),
   mieter:f.tenants.map(t=>({id:t.id,name:t.name,wohnung:t.unitId,einzug:t.start,
     auszug:t.end,personen:t.people,abrechnungRolle:t.private?"Privatanteil":"Mieter"})),
   kostenarten:f.costs.map(c=>({id:c.id,kostenart:c.name,gesamtbetrag:c.amount,
     inNK:c.enabled?"Ja":"Nein",umlageschluessel:c.basis}))
 }};
 const preview=bridge.project(legacy);
 assert.equal(preview.normalized.qualityInput.tenants[1].people,1);
 assert.equal(preview.normalized.qualityInput.costs[0].amount,250.25);
 assert.equal(quality.evaluateEarly(preview.normalized.qualityInput).counts.experimental,10);
 legacy.state.kostenarten[0].gesamtbetrag=0;
 const bad=quality.evaluateEarly(bridge.project(legacy).normalized.qualityInput);
 assert.equal(bad.rows.find(r=>r.ruleId==="NKP-FACH-010").status,"critical");
});
