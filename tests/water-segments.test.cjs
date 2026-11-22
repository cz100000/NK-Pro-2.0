"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const water=require("../water-detail.js");
const state=()=>water.example({fixture:true,period:"2025",houseWater:15,
 costs:[{id:"water",amount:150}],units:[{id:"U",waterStart:100,waterEnd:115}]});
test("physical replacement preserves immutable annual readings and keeps cumulative consumption",()=>{
 const x=state(),before=JSON.stringify(x);
 const r=water.registerReplacement(x,"U","cold",{
    at:"2025-06-01",oldEnd:103,newNumber:"DEMO-KW-NEW",newStart:0,newEnd:2,note:"Wechsel"
 });
 assert.equal(JSON.stringify(x),before);
 assert.equal(r.units[0].waterMeters.cold.segments.length,2);
 assert.equal(water.meterResult(r.units[0].waterMeters.cold).consumption,5);
 assert.equal(water.diagnostics(r).totals.units,15);
});
test("replacement rejects duplicate meter ID and out-of-order time",()=>{
 const x=state();
 assert.throws(()=>water.registerReplacement(x,"U","cold",{at:"2025-01-01",oldEnd:103,newNumber:"X",newStart:0,newEnd:2}),/Invalid meter replacement/);
 assert.throws(()=>water.registerReplacement(x,"U","cold",{at:"2025-06-01",oldEnd:103,newNumber:"DEMO-KW-01",newStart:0,newEnd:2}),/already used/);
});
test("decimal raw readings remain exact; special 2025 rule rounds each endpoint only if explicitly evidenced",()=>{
 const x=state();
 x.units[0].waterMeters.cold.start=100;
 x.units[0].waterMeters.cold.end=123.55;
 const ordinary=water.diagnostics(x);
 assert.equal(ordinary.roundEachToWhole,false);
 assert.ok(Math.abs(ordinary.rows[0].cold.consumption-23.55)<1e-8);
 x.meta={confirmed2025Evidence:{water:{houseConsumption:275,readingDate:"2025-12-30"}}};
 const special=water.diagnostics(x);
 assert.equal(special.roundEachToWhole,true);
 assert.equal(special.rows[0].cold.consumption,24);
 assert.ok(Math.abs(special.rows[0].cold.rawConsumption-23.55)<1e-8);
});
test("overlapping meter periods block reconciliation",()=>{
 const x=state();
 x.units[0].waterMeters.cold.segments=[
 {id:"A",start:1,end:5,startDate:"2025-01-01",endDate:"2025-07-20"},
 {id:"B",start:0,end:2,startDate:"2025-07-01",endDate:"2025-12-30"}];
 const r=water.diagnostics(x);
 assert.equal(r.rows[0].cold.valid,false);
 assert.equal(r.totals.units,null);
 assert.ok(r.issues.some(i=>i.code==="METER_KW_INCOMPLETE"));
});
test("carryforward is a preview, requires identical meter and never overwrites existing start",()=>{
 const n=state(),p=JSON.parse(JSON.stringify(n));p.period="2024";
 n.units[0].waterMeters.cold.start="";
 let preview=water.carryForwardPreview(p,n);
 assert.equal(preview.find(x=>x.kind==="cold").status,"ready");
 n.units[0].waterMeters.cold.start=100;
 preview=water.carryForwardPreview(p,n);
 assert.equal(preview.find(x=>x.kind==="cold").status,"current-start-already-set");
 n.units[0].waterMeters.cold.number="different";
 preview=water.carryForwardPreview(p,n);
 assert.equal(preview.find(x=>x.kind==="cold").status,"meter-changed");
});
test("price output isolates rounded display and exact automatic calculation",()=>{
 const x=water.priceFor({amount:100,landlordShare:0},3);
 assert.equal(x.effective,33.3333);
 assert.equal(x.effectiveRaw,100/3);
});
