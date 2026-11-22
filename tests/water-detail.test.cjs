"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const water=require("../water-detail.js");
const example=()=>({fixture:true,period:"2025",houseWater:15,
  costs:[{id:"water",name:"Wasser",amount:150}],
  units:[{id:"TEST-1",waterStart:100,waterEnd:115}]});
test("explicit synthetic-only 2025 input and non-mutating upgrade",()=>{
 assert.throws(()=>water.upgrade({period:"2025",units:[],costs:[]}),/Synthetic/);
 const a=example(),before=JSON.stringify(a),newState=water.upgrade(a);
 assert.equal(JSON.stringify(a),before);
 assert.equal(newState.units[0].waterMeters.cold.end,115);
 assert.equal(newState.units[0].waterMeters.hot.end,"");
 assert.match(newState.units[0].waterSourceNotice,/Ein-Zähler-Demo/);
});
test("example seeding uses two physical meter channels but keeps totals",()=>{
 const x=example();x.houseWater=15;x.units[0].waterEnd=115;
 const y=water.example(x),d=water.diagnostics(y);
 assert.equal(d.rows[0].cold.consumption,5);
 assert.equal(d.rows[0].hot.consumption,10);
 assert.equal(d.totals.units,15);
 assert.equal(d.house.valid,true);
 assert.equal(d.house.consumption,266);
 assert.equal(d.delta.houseUnits,251);
});
test("separate KW and WW dates and reverse values are checked",()=>{
 const x=water.example(example());
 x.units[0].waterMeters.hot.end=299;
 assert.ok(water.diagnostics(x).issues.some(i=>i.code==="METER_WW_INCOMPLETE"));
 x.units[0].waterMeters.hot.end=310;
 x.units[0].waterMeters.cold.endDate="2025-02-29";
 assert.ok(water.diagnostics(x).issues.some(i=>i.code==="METER_KW_INCOMPLETE"));
});
test("invoice, house and apartment reconciliation remain distinct",()=>{
 const x=water.example(example());x.houseWater=267;
 const d=water.diagnostics(x);
 assert.equal(d.delta.invoiceHouse,1);
 assert.equal(d.delta.houseUnits,251);
 assert.equal(d.delta.invoiceUnits,252);
});
test("price per m3 uses four decimals and supports validated manual override",()=>{
 const c={amount:1642.31,landlordShare:0};
 const p=water.priceFor(c,275);
 assert.equal(p.auto,5.972);
 assert.equal(p.effective,5.972);
 assert.equal(p.mode,"auto");
 const override=water.priceFor({...c,priceMode:"manual",unitPrice:6.3217},275);
 assert.equal(override.effective,6.3217);
 assert.equal(override.auto,5.972);
 assert.equal(water.priceFor({...c,priceMode:"manual",unitPrice:0},275).valid,false);
 assert.equal(water.priceFor({...c,priceMode:"manual",unitPrice:-1},275).valid,false);
 assert.equal(water.priceFor(c,0).valid,false);
});
test("no missing data can be mistaken for zero real consumption",()=>{
 const x=water.upgrade(example()),d=water.diagnostics(x);
 assert.equal(d.totals.units,null);
 assert.equal(d.house.valid,false);
 assert.equal(d.canReview,false);
 assert.equal(d.exactMatch,false);
});
