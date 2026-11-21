"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const hash=require("node:crypto");
const port=require("../experimental/water-2025.js");
const legacy=fs.readFileSync(path.join(__dirname,"reference","billing-calculation-v99.4.86.js"),"utf8");
const gitSha=hash.createHash("sha1").update("blob "+Buffer.byteLength(legacy)+"\0").update(legacy).digest("hex");
const EXPECTED="59947f89249457a505deb5eb8c674350b01b9f30";
function fixture(){
 return{
  meta:{abrechnungsjahr:"2025",confirmed2025Evidence:{water:{houseConsumption:275,readingDate:"2025-12-30"}}},
  mieter:[{id:"DEMO-M1",wohnung:"DEMO-U1"},{id:"DEMO-M0",wohnung:"DEMO-U0",abrechnungRolle:"Privatanteil"}],
  waterMeters:{settings:{houseWaterTotal:275},readings:[
   {meterId:"DEMO-A",kwStart:10.2,kwEnd:36.8,wwStart:101,wwEnd:112.5},
   {meterId:"DEMO-B",kwStart:123.55,kwEnd:147.49,wwStart:17.2,wwEnd:30.8}
  ]}
 };
}
function original(s){
 const context=vm.createContext({
 state:s,
 num:v=>Number.isFinite(Number(v))?Number(v):0,
 hasEnteredMeterValue:v=>v!==undefined&&v!==null&&v!==""&&Number.isFinite(Number(v)),
 ensureWaterMeterData:()=>{},
 isWaterCost:id=>id==="K002",
 NKProCostActions:{normalizeCostSettings(){}},
 MANUAL_INPUT_MODES:["Zählerstände","Verbrauchsmenge","Direkter Eurobetrag","Externe Einzelabrechnung"],
 UMLAGE_MANUAL:"Manuelle Eingabe je Mieter/Wohneinheit",UMLAGE_MANUAL_LEGACY:"legacy-manual",
 COST_EXCLUSION_OWNER:"owner",COST_EXCLUSION_FULL:"full"
 });
 vm.runInContext(legacy,context,{timeout:3000});
 return context.NKProBillingCalculation;
}
test("pinned legacy water source has not changed",()=>assert.equal(gitSha,EXPECTED));
test("K002 confirmed 2025 rounds opening AND closing values per meter",()=>{
 const s=fixture(),old=original(s);
 assert.equal(port.confirmedWhole2025(s),true);
 for(const row of s.waterMeters.readings){
  for(const prefix of ["kw","ww"])assert.equal(port.meterConsumption(row,prefix,s),old.waterConsumption(row,prefix,s));
 }
 assert.equal(port.meterConsumption(s.waterMeters.readings[1],"kw",s),23); // 124 -> 147
});
test("private participant gets same 2025 water treatment as other participants",()=>{
 const s=fixture(),old=original(s);
 for(let i=0;i<s.mieter.length;i++)assert.equal(port.totalForTenant(s,i),old.meterTotalForCostAndTenant("K002",i));
 assert.ok(port.totalForTenant(s,1)>0);
});
test("no automatic substitution for missing 2025 apartment reading",()=>{
 const s=fixture(),old=original(s);
 s.waterMeters.readings[0].kwEnd="";
 assert.equal(port.totalForTenant(s,0),old.meterTotalForCostAndTenant("K002",0));
 const d=port.diagnostics(s);
 assert.ok(d.issues.some(x=>x.code==="MISSING_READING"));
});
test("reverse reading yields 0 in legacy while diagnostic blocks it",()=>{
 const s=fixture(),old=original(s);
 s.waterMeters.readings[0].kwEnd=1;
 assert.equal(port.meterConsumption(s.waterMeters.readings[0],"kw",s),old.waterConsumption(s.waterMeters.readings[0],"kw",s));
 assert.ok(port.diagnostics(s).issues.some(x=>x.code==="REVERSED_READING"));
});
test("unauthorized rounding disabled for other years or unmatched evidence",()=>{
 const s=fixture(),old=original(s);
 delete s.meta.confirmed2025Evidence;
 assert.equal(port.confirmedWhole2025(s),false);
 assert.equal(port.meterConsumption(s.waterMeters.readings[0],"kw",s),old.waterConsumption(s.waterMeters.readings[0],"kw",s));
 assert.throws(()=>port.totalForTenant(s,0),/Only the confirmed/);
});
test("household gap is reported and NEVER distributed across meters",()=>{
 const s=fixture(),before=JSON.stringify(s);
 const d=port.diagnostics(s);
 assert.equal(d.house,275);
 assert.ok(d.gap>0);
 assert.equal(d.unallocatedGap,d.gap);
 assert.ok(d.issues.some(x=>x.code==="HOUSE_UNITS_DIFFERENCE"));
 assert.equal(JSON.stringify(s),before);
});
test("carryforward drafts prior end values only if meter identity matches",()=>{
 const prior=fixture(),next=fixture();
 prior.waterMeters.readings[0].kwEnd=31;prior.waterMeters.readings[0].wwEnd=41;
 next.waterMeters.readings[0].kwStart="";next.waterMeters.readings[0].wwStart=999;
 const before=JSON.stringify(next);
 const r=port.carryForward(prior,next);
 assert.equal(r.draft.waterMeters.readings[0].kwStart,31);
 assert.equal(r.draft.waterMeters.readings[0].wwStart,999);
 assert.equal(r.changes.length,1);
 assert.equal(r.committed,false);
 assert.equal(JSON.stringify(next),before);
});
test("carryforward rejects ambiguous identity and non-integer prior end",()=>{
 const prior=fixture(),next=fixture();
 next.waterMeters.readings[0].meterId="OTHER";
 next.waterMeters.readings[0].kwStart="";
 next.waterMeters.readings[1].kwStart="";
 prior.waterMeters.readings[1].kwEnd=17.5;
 const r=port.carryForward(prior,next);
 assert.ok(r.issues.some(x=>x.code==="METER_IDENTITY_NOT_MATCHED"));
 assert.ok(r.issues.some(x=>x.code==="PRIOR_END_NOT_WHOLE"));
 assert.equal(r.changes.length,0);
});

