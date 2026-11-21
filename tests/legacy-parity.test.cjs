"use strict";
/* Contract tests execute the PINNED, ACTUAL V99.4.86 calculation module in an
   isolated Node vm context with synthetic input. No user data, no browser storage. */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const crypto=require("node:crypto");
const port=require("../experimental/settlement-cost.js");
const pinned=fs.readFileSync(path.join(__dirname,"reference","billing-calculation-v99.4.86.js"),"utf8");
const sha=crypto.createHash("sha1").update("blob "+Buffer.byteLength(pinned)+"\0").update(pinned).digest("hex");
test("legacy source is frozen at its original Git blob",()=>assert.equal(sha,"59947f89249457a505deb5eb8c674350b01b9f30"));
function original(input){
  const state={
    wohnungen:input.units.map(u=>({id:u.id,wohnflaeche:u.area,status:u.active?"aktiv":"inaktiv"})),
    mieter:input.tenants.map((t,i)=>({
      id:t.id,name:"TEST-"+i,wohnung:t.unitId,originalIndex:i,aktiveTage:t.days,
      wohnflaeche:t.area,personen:t.persons,personentage:t.personDays||0,
      nutzungsart:t.private?"Privat":"vermietet"
    })),
    kostenarten:[],kostenartenMieterUmlage:{},vorauszahlungen:[],meterReadings:{readings:{}},umlageInputs:{}
  };
  const cost=input.cost;
  if(cost.excludedTenantIds?.length)state.kostenartenMieterUmlage[cost.id]=Object.fromEntries(cost.excludedTenantIds.map(id=>[id,false]));
  state.umlageInputs[cost.id]={values:input.tenants.map(t=>t.consumption||0),mode:"Verbrauchsmenge"};
  const env={
    state,
    num:v=>{const n=Number(v);return Number.isFinite(n)?n:0;},
    NKProCostActions:{normalizeCostSettings(){}},
    MANUAL_INPUT_MODES:["Zählerstände","Verbrauchsmenge","Direkter Eurobetrag","Externe Einzelabrechnung"],
    UMLAGE_MANUAL:"Manuelle Eingabe je Mieter/Wohneinheit",
    UMLAGE_MANUAL_LEGACY:"legacy-manual",
    COST_EXCLUSION_FULL:"full",COST_EXCLUSION_OWNER:"owner",
    hasEnteredMeterValue:v=>v!==undefined&&v!==null&&v!==""&&Number.isFinite(Number(v))
  };
  const context=vm.createContext(env,{name:"legacy-pinned-v99486"});
  vm.runInContext(pinned,context,{filename:"billing-calculation-v99.4.86.js",timeout:3000});
  const c={
    id:cost.id,kostenart:"Muster",inNK:"Ja",gesamtbetrag:cost.amount,umlageschluessel:cost.method,
    ausschlussBehandlung:cost.exclusionMode==="owner"?"owner":"full",
    gesamtverbrauch:cost.houseConsumption||0,preisProEinheit:cost.pricePerUnit||0,
    preisProEinheitManuell:!!cost.manualPrice
  };
  const output=context.NKProBillingCalculation.allocationForCost(c,state.mieter);
  return JSON.parse(JSON.stringify(output));
}
const U=(id,area=70,active=true)=>({id,area,active});
const T=(id,unitId,area,days=365,persons=1,consumption=0,privateUse=false)=>({
  id,unitId,area,days,persons,consumption,private:privateUse
});
const cases=[
  {name:"Wohnfläche with part-year private occupant",cost:{id:"K-AREA",amount:180,method:"Wohnfläche"},
    units:[U("A",70),U("B",80)],tenants:[T("M1","A",70),T("M0","B",80,100,1,0,true)]},
  {name:"Personentage",cost:{id:"K-PEOPLE",amount:105,method:"Personen"},
    units:[U("A",70),U("B",80)],tenants:[T("M1","A",70,365,2),T("M2","B",80,100,1)]},
  {name:"Miettage",cost:{id:"K-DAYS",amount:90,method:"Miettage"},
    units:[U("A",70),U("B",80)],tenants:[T("M1","A",70),T("M2","B",80,200)]},
  {name:"Verbrauch leaves owner remainder",cost:{id:"K-CONS",amount:1642.31,method:"Verbrauch",houseConsumption:275},
    units:[U("A",70),U("B",80)],tenants:[T("M1","A",70,365,1,90),T("M0","B",80,365,1,100,true)]},
  {name:"alle Wohnungen with empty unit",cost:{id:"K-EQUAL",amount:225,method:"Verteilung auf alle Wohneinheiten"},
    units:[U("A",70),U("B",80),U("C",60)],tenants:[T("M1","A",70),T("M2","B",80,200)]},
  {name:"nur aktive Wohnungen",cost:{id:"K-ACTIVE",amount:225,method:"Verteilung nur auf aktive Wohneinheiten"},
    units:[U("A",70),U("B",80,false),U("C",60)],tenants:[T("M1","A",70),T("M2","B",80,200)]},
  {name:"Owner treated exclusions in area distribution",cost:{id:"K-OWNER-AREA",amount:180,method:"Wohnfläche",exclusionMode:"owner",excludedTenantIds:["M2"]},
    units:[U("A",70),U("B",80)],tenants:[T("M1","A",70),T("M2","B",80)]},
  {name:"Owner treated exclusions in consumption",cost:{id:"K-OWNER-WATER",amount:330,method:"Verbrauch",houseConsumption:100,exclusionMode:"owner",excludedTenantIds:["M2"]},
    units:[U("A",70),U("B",80)],tenants:[T("M1","A",70,365,1,40),T("M2","B",80,365,1,30)]},
  {name:"Mieterwechsel within one apartment",cost:{id:"K-EQUAL-SPLIT",amount:123.45,method:"Verteilung auf alle Wohneinheiten"},
    units:[U("A",70),U("B",60)],tenants:[T("M1","A",70,150),T("M2","A",70,215),T("M3","B",60,365)]}
];
function compare(fixture){
  const a=original(fixture),b=port.calculateCost(fixture);
  for(let i=0;i<fixture.tenants.length;i++){
    const id=fixture.tenants[i].id;
    assert.ok(Math.abs(a.allocations[i]-b.allocations[id])<1e-8,
      fixture.name+": amount for "+id+" differs: "+a.allocations[i]+" vs "+b.allocations[id]);
  }
  for(const name of ["ownerShare","basisTotal","inputSum"]){
    assert.ok(Math.abs(a[name]-b[name])<1e-8,
      fixture.name+": "+name+" differs: "+a[name]+" vs "+b[name]);
  }
  assert.equal(b.status,a.status,fixture.name+": status differs");
}
for(const fixture of cases)test("legacy parity: "+fixture.name,()=>compare(fixture));
test("exhaustive selected method surface is explicitly bounded",()=>{
  assert.equal(port.SUPPORTED.length,6);
  assert.throws(()=>port.calculateCost({...cases[0],cost:{id:"BAD",amount:1,method:"External Techem"}}),/Unsupported/);
});
test("experimental engine does not mutate the normalized fixture",()=>{
  for(const fixture of cases){
    const before=JSON.stringify(fixture);
    port.calculateCost(fixture);
    assert.equal(JSON.stringify(fixture),before);
  }
});
test("all private-use tenancies remain settlement participants",()=>{
  const fixture=cases[0],computed=port.calculateCost(fixture);
  assert.ok(computed.allocations.M0>0);
  assert.ok(computed.allocations.M1>0);
});
