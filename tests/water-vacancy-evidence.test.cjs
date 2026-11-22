"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const water=require("../water-detail.js");
function sample(){
 const x=water.example({fixture:true,period:"2025",houseWater:15,
 costs:[{id:"water",amount:150}],units:[{id:"U",waterStart:100,waterEnd:115}]});
 x.tenancies=[{id:"A",unitId:"U",start:"2025-01-01",end:"2025-06-30"},
 {id:"B",unitId:"U",start:"2025-07-15",end:"2025-12-31"}];
 return x;
}
test("vacancy duration determined without manual consumption or arbitrary zero",()=>{
 const x=sample(),v=water.vacancyFromReadings(x).U;
 assert.equal(v.gaps.length,1);assert.equal(v.gaps[0].days,14);
 assert.equal(v.valid,false);assert.equal(v.gaps[0].cold,null);
});
test("interim readings at leave/arrival boundaries compute measured vacancy",()=>{
 let x=sample();
 const original=JSON.stringify(x);
 for(const kind of ["cold","hot"]){
   const m=x.units[0].waterMeters[kind];
   x=water.addInterimReading(x,"U",kind,"2025-06-30",Number(m.start)+2);
   x=water.addInterimReading(x,"U",kind,"2025-07-15",Number(m.start)+3);
 }
 assert.equal(water.vacancyFromReadings(x).U.valid,true);
 assert.equal(water.vacancyFromReadings(x).U.cold,1);
 assert.equal(water.vacancyFromReadings(x).U.hot,1);
 assert.equal(water.diagnostics(x).vacancyByUnit.U.cold,1);
 assert.ok(original.length>0);
});
test("duplicate or declining readings are rejected",()=>{
 let x=sample();
 x=water.addInterimReading(x,"U","cold","2025-06-30",102);
 assert.throws(()=>water.addInterimReading(x,"U","cold","2025-06-30",102),/Duplicate/);
 assert.throws(()=>water.addInterimReading(x,"U","cold","2025-07-15",99),/reverses/);
});
