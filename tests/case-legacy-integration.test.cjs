"use strict";
/* Fully synthetic, case-level browser adapter vs pinned NK-Pro 1.0 cost engine. */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const property=require("../synthetic-property.js");
const water=require("../water-detail.js");
const engine=require("../synthetic-case-billing.js");
const originalCode=fs.readFileSync(path.join(__dirname,"reference","billing-calculation-v99.4.86.js"),"utf8");
function fixture(){
 const input={fixture:true,period:"2025",houseWater:100,
 units:[{id:"U1",area:60,active:true,advance:120,waterStart:0,waterEnd:50},
 {id:"U2",area:80,active:true,advance:200,waterStart:0,waterEnd:50}],
 costs:[]};
 const x=property.upgrade(input);
 x.waterSettings={houseStart:0,houseEnd:100,houseStartDate:"2025-01-01",houseEndDate:"2025-12-30"};
 for(const u of x.units)u.waterMeters={
  cold:{number:u.id+"-KW",start:0,end:30,startDate:"2025-01-01",endDate:"2025-12-30"},
  hot:{number:u.id+"-WW",start:0,end:20,startDate:"2025-01-01",endDate:"2025-12-30"}
 };
 x.tenancies[0].end="2025-06-30";
 x.tenancies[0].consumptionCold=13;x.tenancies[0].consumptionHot=7;
 x.tenancies.push({id:"T3",unitId:"U1",name:"Synthetisch neu",start:"2025-07-01",
 end:"2025-12-31",role:"Mieter",persons:2,advance:50,
 consumptionCold:17,consumptionHot:13});
 x.tenancies[1].role="Privatanteil";
 x.costs=[
  {id:"A",name:"Fläche",method:"Wohnfläche",amount:425.35,landlordShare:0},
  {id:"P",name:"Personen",method:"Personen",amount:345.99,landlordShare:0},
  {id:"D",name:"Miettage",method:"Miettage",amount:238.01,landlordShare:0},
  {id:"U",name:"Wohneinheiten",method:"Verteilung auf alle Wohneinheiten",amount:300.03,landlordShare:0},
  {id:"W",name:"Wasser",method:"Verbrauch",amount:999.99,landlordShare:0,
    consumptionTotal:100,consumptionByTenant:{[x.tenancies[0].id]:20,[x.tenancies[1].id]:50,T3:30}},
  {id:"O",name:"Owner-Ausschluss",method:"Wohnfläche",amount:400,landlordShare:0,
    exclusionMode:"owner",excludedTenantIds:[x.tenancies[1].id]}
 ];
 return x;
}
function original(cost,units,tenants){
 const state={
  wohnungen:units.map(u=>({id:u.id,wohnflaeche:u.area,status:u.active?"aktiv":"inaktiv"})),
  mieter:tenants.map((t,i)=>({id:t.id,name:t.name,wohnung:t.unitId,originalIndex:i,
    aktiveTage:t.days,wohnflaeche:t.area,personen:t.persons,personentage:t.personDays,
    abrechnungRolle:t.role})),
  kostenarten:[],kostenartenMieterUmlage:{},vorauszahlungen:[],meterReadings:{readings:{}},umlageInputs:{}
 };
 if(cost.excludedTenantIds?.length)
  state.kostenartenMieterUmlage[cost.id]=Object.fromEntries(cost.excludedTenantIds.map(id=>[id,false]));
 state.umlageInputs[cost.id]={values:tenants.map(t=>cost.method==="Verbrauch"?
    Number(cost.consumptionByTenant?.[t.id]??0):0),mode:"Verbrauchsmenge"};
 const sandbox={state,
  num:v=>{const n=Number(v);return Number.isFinite(n)?n:0;},
  NKProCostActions:{normalizeCostSettings(){}},
  MANUAL_INPUT_MODES:["Zählerstände","Verbrauchsmenge","Direkter Eurobetrag","Externe Einzelabrechnung"],
  UMLAGE_MANUAL:"Manuelle Eingabe je Mieter/Wohneinheit",UMLAGE_MANUAL_LEGACY:"legacy-manual",
  COST_EXCLUSION_FULL:"full",COST_EXCLUSION_OWNER:"owner",
  hasEnteredMeterValue:v=>v!==undefined&&v!==null&&v!==""&&Number.isFinite(Number(v))
 };
 const ctx=vm.createContext(sandbox);
 vm.runInContext(originalCode,ctx,{filename:"pinned-v99.4.86.js",timeout:3000});
 const cc={id:cost.id,kostenart:cost.name,inNK:"Ja",gesamtbetrag:cost.amount-cost.landlordShare,
  umlageschluessel:cost.method,berechnungsart:"Automatisch",
  ausschlussBehandlung:cost.exclusionMode==="owner"?"owner":"full",
  gesamtverbrauch:cost.consumptionTotal??0,
  preisProEinheit:0,preisProEinheitManuell:false};
 return JSON.parse(JSON.stringify(ctx.NKProBillingCalculation.allocationForCost(cc,state.mieter)));
}
test("integrated synthetic case-level cost reference matches original 1.0 on six cost variants",()=>{
 const x=fixture(),before=JSON.stringify(x);
 const r=engine.calculate(x);
 assert.equal(JSON.stringify(x),before);
 assert.equal(r.issues.length,1);
 assert.equal(r.issues[0].code,"UNALLOCATED_REFERENCE");
 assert.equal(r.tenants.length,3);
 const cases=property.inspect(x,water.diagnostics(x)).cases;
 for(const cost of x.costs){
  const result=r.costs.find(c=>c.id===cost.id);
  const pinned=original(cost,x.units,cases);
  assert.equal(result.referenceStatus,pinned.status,cost.id);
  for(let i=0;i<cases.length;i++){
   const expected=pinned.allocations[i],actual=result.rows[i].referenceExact;
   assert.ok(Math.abs(actual-expected)<1e-8,
     cost.id+" "+cases[i].id+" "+actual+" vs "+expected);
   assert.ok(Math.abs(result.rows[i].cents/100-expected)<=0.015,
     "cent projection "+cost.id+" "+cases[i].id);
  }
  assert.ok(Math.abs(result.referenceOwnerCents/100-pinned.ownerShare)<=0.015);
 }
});
