"use strict";
/*
 * Compare the seven synthetic early quality checks with the actual, pinned
 * V99.4.86 evaluateFactual() on carefully constructed synthetic fixtures.
 * No real state is read; source instrumentation is in-memory, never written
 * back to the legacy repository.
 */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const quality=require("../experimental/quality-contract.js");
const pinned=fs.readFileSync(path.join(__dirname,"reference","quality-rules-v99.4.86.js"),"utf8");
const marker="  global.NKProQualityRules=Object.freeze(";
assert.equal(pinned.split(marker).length,2,"Expected pinned original export not found");
const instrumented=pinned.replace(marker,
 "  global.__NKPRO_FACTUAL_TEST_ONLY = evaluateFactual;\n"+marker);
function fixture(){
 return{
   fixtureKind:"synthetic",
   period:{year:"2025",start:"2025-01-01",end:"2025-12-31"},
   units:[{id:"U-1",status:"aktiv"},{id:"U-2",status:"aktiv"}],
   tenants:[
     {id:"M-1",name:"Synthetischer Mieter 1",unitId:"U-1",start:"2025-01-01",end:"2025-06-30"},
     {id:"M-2",name:"Synthetischer Mieter 2",unitId:"U-1",start:"2025-07-01",end:"2025-12-31"},
     {id:"M-0",name:"Synthetischer Privatanteil",unitId:"U-2",start:"2010-01-01",end:"",private:true}
   ]
 };
}
function legacyRun(model){
 const state={
  meta:{abrechnungsjahr:model.period.year,abrechnungsbeginn:model.period.start,
   abrechnungsende:model.period.end},
  wohnungen:model.units.map(u=>({id:u.id,status:u.status,wohnflaeche:60})),
  mieter:model.tenants.map((t,i)=>({
   id:t.id,wohnung:t.unitId,name:t.name,einzug:t.start,auszug:t.end,
   abrechnungRolle:t.private?"Privatanteil":"Mieter",originalIndex:i,aktiveTage:365,
   personen:1
  })),
  kostenarten:[],jahresArchiv:[],umlageInputs:{}
 };
 const env={state};
 // These four wrappers reproduce the visibility filters for the fixture,
 // including participants with temporarily incomplete names.
 env.visibleTenantRows=()=>state.mieter;
 env.billableTenantRows=()=>state.mieter;
 env.privateTenantRows=()=>state.mieter.filter(x=>x.abrechnungRolle==="Privatanteil");
 env.periodStart=()=>state.meta.abrechnungsbeginn;
 env.periodEnd=()=>state.meta.abrechnungsende;
 env.tenantRelevantForCurrentBilling=()=>true;
 const ctx=vm.createContext(env);
 vm.runInContext(instrumented,ctx,{filename:"quality-rules-v99.4.86.js",timeout:3000});
 const actual=ctx.__NKPRO_FACTUAL_TEST_ONLY(state);
 return JSON.parse(JSON.stringify(actual.results));
}
function compare(model,scenario){
 const old=legacyRun(model),fresh=quality.evaluateEarly(model);
 for(const rule of quality.EARLY_RULES){
  const rows=old.filter(x=>x.ruleId===rule);
  assert.ok(rows.length,scenario+": original "+rule+" missing");
  const oldCritical=rows.some(x=>x.status==="Kritischer Abrechnungsmangel");
  const current=fresh.rows.find(x=>x.ruleId===rule);
  assert.ok(current,scenario+": current "+rule+" missing");
  assert.equal(current.status==="critical",oldCritical,
   scenario+": rule "+rule+" diverged: "+JSON.stringify(rows.map(x=>x.status)));
 }
 assert.equal(fresh.readyForRealFinalization,false);
}
test("all seven early checks match pinned original on normal 2025 private and tenant-change fixture",()=>compare(fixture(),"normal"));
test("year mismatch and impossible February date agree with original",()=>{
 const f=fixture();f.period.end="2025-02-29";compare(f,"invalid calendar end");
 f.period.end="2025-12-31";f.period.year="2024";compare(f,"year mismatch");
});
test("no active apartments or zero participating tenancies agree",()=>{
 const f=fixture();f.units.forEach(u=>u.status="inaktiv");compare(f,"inactive apartments");
 const g=fixture();g.tenants=[];compare(g,"zero tenancies");
});
test("missing tenant name, missing apartment link agree on selected checks",()=>{
 const f=fixture();f.tenants[1].name="";compare(f,"name missing");
 const g=fixture();g.tenants[1].unitId="UNIT-NOT-EXIST";compare(g,"dangling unit");
});
test("same day overlapping tenancy and end-before-start agree with original",()=>{
 const f=fixture();f.tenants[1].start="2025-06-30";compare(f,"one-day overlap");
 const g=fixture();g.tenants[1].end="2024-12-31";compare(g,"reversed rental period");
});
test("comparison fixture is completely synthetic and does not change inputs",()=>{
 const f=fixture(),before=JSON.stringify(f);
 compare(f,"immutable");
 assert.equal(JSON.stringify(f),before);
});
