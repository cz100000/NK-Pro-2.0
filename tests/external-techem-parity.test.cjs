"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const port=require("../experimental/external-techem.js");
const legacy=fs.readFileSync(path.join(__dirname,"reference","billing-calculation-v99.4.86.js"),"utf8");
function fixture(){
 return{period:{start:"2025-01-01",end:"2025-12-31"},
  units:[{id:"DEMO-U1"},{id:"DEMO-U2"},{id:"DEMO-U3"}],
  tenants:[
   {id:"DEMO-M1",unitId:"DEMO-U1",start:"2025-01-01",end:"2025-06-30"},
   {id:"DEMO-M2",unitId:"DEMO-U1",start:"2025-07-01",end:"2025-12-31"},
   {id:"DEMO-M0",unitId:"DEMO-U2",private:true,start:"2025-01-01",end:"2025-12-31"}
  ],
  cost:{id:"K-DEMO",amount:1020,method:"Externe Einzelabrechnung"},
  externalOwnerShare:3.88,values:{}};
}
function original(input){
 const data={
  meta:{abrechnungsjahr:"2025",abrechnungsbeginn:input.period.start,abrechnungsende:input.period.end},
  wohnungen:input.units.map(u=>({id:u.id,bezeichnung:u.id,status:"aktiv"})),
  mieter:input.tenants.map((t,i)=>({id:t.id,name:"Synth "+i,wohnung:t.unitId,einzug:t.start,auszug:t.end,
    abrechnungRolle:t.private?"Privatanteil":"Mieter",originalIndex:i})),
  kostenarten:[],vorauszahlungen:[],kostenartenMieterUmlage:{},umlageInputs:{},
  meterReadings:{readings:{}}
 };
 if(input.cost.excludedTenantIds) data.kostenartenMieterUmlage[input.cost.id]=Object.fromEntries(input.cost.excludedTenantIds.map(x=>[x,false]));
 data.umlageInputs[input.cost.id]={
  mode:"Externe Einzelabrechnung",
  caseValues:Object.fromEntries(Object.entries(input.values).map(([key,amount])=>[key,{amount,source:"synthetic"}])),
  values:input.tenants.map(()=>0),
  externalBilling:{includedOwnerShare:input.externalOwnerShare}
 };
 const context=vm.createContext({
  state:data,num:v=>Number.isFinite(Number(v))?Number(v):0,
  tenantRelevantForCurrentBilling:()=>true,
  NKProCostActions:{normalizeCostSettings(){}},
  MANUAL_INPUT_MODES:["Zählerstände","Verbrauchsmenge","Direkter Eurobetrag","Externe Einzelabrechnung"],
  UMLAGE_MANUAL:"Manuelle Eingabe je Mieter/Wohneinheit",
  UMLAGE_MANUAL_LEGACY:"legacy-manual",
  COST_EXCLUSION_FULL:"Vollständig umlegen",
  COST_EXCLUSION_OWNER:"Nicht umlagefähig / Eigentümeranteil"
 });
 vm.runInContext(legacy,context,{timeout:3000});
 const k={id:input.cost.id,kostenart:"Muster Extern",inNK:"Ja",gesamtbetrag:input.cost.amount,
  umlageschluessel:"Manuelle Eingabe je Mieter/Wohneinheit",ausschlussBehandlung:
  input.cost.exclusionMode==="owner"?"Nicht umlagefähig / Eigentümeranteil":"Vollständig umlegen"
 };
 const cases=context.NKProBillingCalculation.individualValueCases(data);
 const result=context.NKProBillingCalculation.allocationForCost(k,data.mieter);
 return{cases:JSON.parse(JSON.stringify(cases)),result:JSON.parse(JSON.stringify(result))};
}
function filled(){
 const x=fixture();
 const cases=port.deriveCases(x);
 assert.equal(cases.length,4);
 x.values=Object.fromEntries(cases.map(c=>[c.caseKey,c.role==="vacancy"?46.12:
    c.tenantId==="DEMO-M1"?320:c.tenantId==="DEMO-M2"?410:240]));
 return x;
}
function equivalent(x){
 const old=original(x),a=old.result,b=port.calculateExternal(x);
 const keyProps=["caseKey","role","unitId","tenantId","start","end"];
 assert.deepEqual(b.cases.map(c=>keyProps.map(k=>c[k])),old.cases.map(c=>keyProps.map(k=>c[k])));
 for(const [i,t] of x.tenants.entries())assert.ok(Math.abs(a.allocations[i]-b.allocations[t.id])<1e-8,t.id+" allocation");
 for(const key of ["ownerShare","vacancyShare","externalOwnerShare","documentedOwnerShare","basisTotal","inputSum"])
  assert.ok(Math.abs(a[key]-b[key])<1e-8,key+" differs: "+a[key]+" vs "+b[key]);
 assert.equal(a.status,b.status);
 return b;
}
test("synthetic Techem allocation matches original and keeps 3.88 euro solely owner-side",()=>{
 const r=equivalent(filled());
 assert.equal(r.externalOwnerShare,3.88);
 assert.equal(r.vacancyShare,46.12);
 assert.equal(r.ownerShare,50);
 assert.equal(r.allocations["DEMO-M0"],240);
 assert.equal(r.unclassifiedOwnerShare,0);
 assert.equal(r.issues.length,0);
});
test("real tenant change inside one apartment produces distinct original-compatible cases",()=>{
 const cases=port.deriveCases(fixture());
 assert.equal(cases.filter(c=>c.unitId==="DEMO-U1").length,2);
 assert.ok(cases.every(x=>x.caseKey.includes(x.unitId)));
});
test("empty unit is a vacancy case, not a synthetic tenant",()=>{
 const b=equivalent(filled());
 const vacant=b.cases.filter(x=>x.role==="vacancy");
 assert.equal(vacant.length,1);
 assert.equal(vacant[0].tenantId,"");
});
test("owner-side exclusions remain allocated to owner, not tenants",()=>{
 const x=filled();x.cost.exclusionMode="owner";x.cost.excludedTenantIds=["DEMO-M2"];
 const r=equivalent(x);
 assert.equal(r.allocations["DEMO-M2"],0);
 assert.equal(r.ownerShare,460);
 assert.equal(r.externalOwnerShare,3.88);
 assert.equal(r.excludedOwnerShare,410);
 assert.equal(r.unclassifiedOwnerShare,0);
 assert.equal(r.issues.length,0);
});
test("missing case amount creates a review finding instead of invented source value",()=>{
 const x=filled(),missing=Object.keys(x.values)[0];delete x.values[missing];
 const r=port.calculateExternal(x);
 assert.ok(r.issues.some(y=>y.code==="OPEN_CASE"&&y.caseKey===missing));
 assert.equal(r.readyForDemoReview,false);
});
test("provider mismatch is surfaced, not silently redistributed",()=>{
 const x=filled();x.values[Object.keys(x.values)[0]]+=1;
 const r=equivalent(x);
 assert.ok(r.issues.some(y=>y.code==="PROVIDER_MISMATCH"));
 assert.ok(r.issues.some(y=>y.code==="UNCLASSIFIED_OWNER_BALANCE"));
});
test("input case values, private status, and metadata remain unchanged",()=>{
 const x=filled(),before=JSON.stringify(x);
 equivalent(x);
 assert.equal(JSON.stringify(x),before);
});

