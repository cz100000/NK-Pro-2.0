"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const review=require("../experimental/water-external-review.js");
const ext=require("../experimental/external-techem.js");
function scenario(){
 const units=Array.from({length:7},(_,i)=>({id:"D-UNIT-"+(i+1)}));
 const tenants=[
  {id:"D-M1",unitId:"D-UNIT-1",start:"2025-01-01",end:"2025-06-30"},
  {id:"D-M2",unitId:"D-UNIT-1",start:"2025-07-01",end:"2025-12-31"},
  ...[2,3,4,5].map(i=>({id:"D-M"+(i+1),unitId:"D-UNIT-"+i,start:"2025-01-01",end:"2025-12-31"})),
  {id:"D-M0",unitId:"D-UNIT-6",start:"2025-01-01",end:"2025-12-31",private:true}
 ];
 const providerInput={period:{start:"2025-01-01",end:"2025-12-31"},
   units,tenants,cost:{id:"DEMO-K006",amount:753.88,method:"Externe Einzelabrechnung"},
   externalOwnerShare:3.88,values:{}};
 const cases=ext.deriveCases(providerInput);
 assert.equal(cases.length,8);
 providerInput.values=Object.fromEntries(cases.map(c=>[c.caseKey,c.role==="vacancy"?50:100]));
 const componentCounts=[[20,10],[25,10],[30,10],[30,12],[25,13],[30,15],[30,15]];
 const waterData={
  meta:{abrechnungsjahr:"2025",confirmed2025Evidence:{water:{houseConsumption:275,readingDate:"2025-12-30"}}},
  waterMeters:{settings:{houseWaterTotal:275},readings:componentCounts.map(([cold,hot],i)=>({
   meterId:"D-METER-"+i,kwStart:100+i,kwEnd:100+i+cold,wwStart:200+i,wwEnd:200+i+hot
  }))}
 };
 return{waterData,providerInput};
}
test("synthetic seven-unit house water and Techem source fully reconcile, not production-ready",()=>{
 const s=scenario(),r=review.audit(s);
 assert.equal(r.water.house,275);assert.equal(r.water.units,275);assert.equal(r.water.gap,0);
 assert.ok(Math.abs(r.provider.ownerShare-53.88)<1e-8);assert.equal(r.provider.vacancyShare,50);
 assert.equal(r.provider.externalOwnerShare,3.88);
 assert.ok(Math.abs(r.provider.unclassifiedOwnerShare)<1e-8);
 assert.equal(r.counts.critical,0);assert.equal(r.counts.decisions,0);
 assert.equal(r.experimentalChecksClear,true);
 assert.equal(r.readyForRealFinalization,false);
 assert.ok(r.missingGates.length>0);
});
test("unmeasured water is a decision, never silently distributed",()=>{
 const s=scenario();
 s.waterData.waterMeters.readings[0].kwEnd--;
 const r=review.audit(s);
 assert.equal(r.water.gap,1);
 assert.equal(r.counts.decisions,1);
 assert.equal(r.experimentalChecksClear,false);
 assert.equal(r.readyForRealFinalization,false);
});
test("water decision requires fingerprint and actual written explanation",()=>{
 const s=scenario();s.waterData.waterMeters.readings[0].kwEnd--;
 const first=review.audit(s).checks.find(x=>x.id==="WATER_HOUSE_UNITS_DIFFERENCE");
 const saved={[first.id]:{signature:first.signature,reason:"Abweichung geprüft und dokumentiert."}};
 const accepted=review.audit({...s,decisions:saved});
 assert.equal(accepted.counts.accepted,1);
 assert.equal(accepted.experimentalChecksClear,true);
 assert.equal(accepted.readyForRealFinalization,false);
});
test("water decision becomes stale after any underlying meter change even with same total",()=>{
 const s=scenario();s.waterData.waterMeters.readings[0].kwEnd--;
 const first=review.audit(s).checks.find(x=>x.id==="WATER_HOUSE_UNITS_DIFFERENCE");
 const decisions={[first.id]:{signature:first.signature,reason:"Plausibel und begründet"}};
 s.waterData.waterMeters.readings[0].kwEnd--;
 s.waterData.waterMeters.readings[1].kwEnd++;
 const report=review.audit({...s,decisions});
 assert.equal(report.water.gap,1); // no aggregate change
 assert.equal(report.counts.accepted,0);
 assert.equal(report.counts.decisions,1);
});
test("missing meter is critical and can never be accepted by human override",()=>{
 const s=scenario();
 s.waterData.waterMeters.readings[0].kwEnd="";
 const r=review.audit(s),finding=r.checks.find(x=>x.id==="WATER_MISSING_READING0");
 const approved=review.audit({...s,decisions:{[finding.id]:{signature:finding.signature,reason:"Ignorieren trotz Fehler"}}});
 assert.equal(approved.counts.critical,1);
 assert.equal(approved.experimentalChecksClear,false);
});
test("provider 3.88 euro position never allocated to private or vacancy participant",()=>{
 const s=scenario(),r=review.audit(s);
 assert.equal(r.provider.externalOwnerShare,3.88);
 assert.equal(r.provider.documentedOwnerShare,53.88);
 const provider=ext.calculateExternal(s.providerInput);
 assert.equal(provider.allocations["D-M0"],100);
 assert.equal(provider.vacancyShare,50);
 assert.equal(provider.externalOwnerShare,3.88);
 assert.ok(Math.abs(provider.ownerShare-53.88)<1e-8);
});
test("tampered provider source reveals reconciliation defect",()=>{
 const s=scenario();
 s.providerInput.values[Object.keys(s.providerInput.values)[0]]+=0.02;
 const report=review.audit(s);
 assert.ok(report.counts.critical>=1);
 assert.equal(report.readyForRealFinalization,false);
});
test("read-only review leaves synthetic sources untouched",()=>{
 const s=scenario(),before=JSON.stringify(s);
 review.audit(s);
 assert.equal(JSON.stringify(s),before);
});

