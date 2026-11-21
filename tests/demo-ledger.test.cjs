"use strict";
const {test} = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../demo-ledger.js");
const make = (amount = 100, landlordShare = 0, method = "Fläche") => ({
  costs: [{id:"demo-cost",name:"Mustertest",amount,landlordShare,method}],
  units: [
    {id:"DEMO-1",area:1,waterStart:1,waterEnd:2,advance:10},
    {id:"DEMO-2",area:1,waterStart:5,waterEnd:6,advance:20},
    {id:"DEMO-3",area:1,waterStart:3,waterEnd:4,advance:30}
  ]
});
test("stable largest-remainder allocation preserves every cent", () => {
  assert.deepEqual(engine.allocateCents(101,[1,1,1]),[34,34,33]);
  assert.deepEqual(engine.allocateCents(1,[1,1,1]),[1,0,0]);
  assert.deepEqual(engine.allocateCents(3,[0,0,1]),[0,0,3]);
});
test("landlord share is never allocated to tenants", () => {
  const r=engine.calculate(make(100,3.88));
  assert.equal(r.valid,true);
  assert.equal(r.totals.grossCostsCents,10000);
  assert.equal(r.totals.landlordCostsCents,388);
  assert.equal(r.totals.distributedCents,9612);
  assert.equal(r.totals.differenceCents,0);
});
test("unit balances and aggregate balance always reconcile in cents", () => {
  const r=engine.calculate(make(100));
  assert.equal(r.totals.balanceCents,r.totals.distributedCents-r.totals.advancesCents);
  assert.equal(r.units.reduce((s,u)=>s+u.balanceCents,0),r.totals.balanceCents);
});
test("zero water denominator leaves amount unallocated and blocks review", () => {
  const s=make(100,0,"Verbrauch");
  s.units.forEach(u=>u.waterEnd=u.waterStart);
  const r=engine.calculate(s);
  assert.equal(r.valid,false);
  assert.equal(r.totals.differenceCents,10000);
  assert.ok(r.issues.some(i=>i.code==="ZERO_BASIS"));
});
test("reverse meter is flagged, never silently treated as valid", () => {
  const s=make();s.units[0].waterEnd=0;
  assert.ok(engine.calculate(s).issues.some(i=>i.code==="INVALID_WATER"));
});
test("landlord share greater than costs is blocked", () => {
  assert.ok(engine.calculate(make(100,101)).issues.some(i=>i.code==="INVALID_LANDLORD"));
});
test("a meter edit with unchanged household total invalidates previous review", () => {
  const s=make();
  const before=engine.fingerprintWater(s);
  s.units[0].waterEnd++;
  s.units[1].waterEnd--;
  assert.notEqual(engine.fingerprintWater(s),before);
});
test("a changed cost, prepayment or area invalidates the old letter preflight", () => {
  const s=make();s.houseWater=22;s.period="2025";
  const before=engine.fingerprintLetter(s);
  s.costs[0].amount=111;
  assert.notEqual(engine.fingerprintLetter(s),before);
  s.costs[0].amount=100;s.units[0].advance=13;
  assert.notEqual(engine.fingerprintLetter(s),before);
  s.units[0].advance=10;s.units[0].area=2;
  assert.notEqual(engine.fingerprintLetter(s),before);
});
test("calculation never mutates application inputs", () => {
  const s=make();const before=JSON.stringify(s);
  engine.calculate(s);
  assert.equal(JSON.stringify(s),before);
});
test("invalid money and duplicate identity are blocked", () => {
  const s=make();s.costs[0].amount=-1;s.units[1].id=s.units[0].id;
  const r=engine.calculate(s);
  assert.ok(r.issues.some(i=>i.code==="INVALID_COST"));
  assert.ok(r.issues.some(i=>i.code==="DUPLICATE_UNIT"));
});
test("unknown allocation method does not silently choose floor area", () => {
  const r=engine.calculate(make(100,0,"Personentage"));
  assert.ok(r.issues.some(i=>i.code==="UNKNOWN_METHOD"));
  assert.equal(r.totals.distributedCents,0);
});
test("synthetic seven-unit split reconciles without floats", () => {
  const s=make(1423.77);
  s.units=[31,72,55,102,61,87,49].map((a,i)=>({id:"D"+i,area:a,waterStart:i,waterEnd:i+4,advance:25+i}));
  const r=engine.calculate(s);
  assert.equal(r.valid,true);
  assert.equal(r.totals.distributedCents,142377);
  assert.equal(r.totals.differenceCents,0);
});
