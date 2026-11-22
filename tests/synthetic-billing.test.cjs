"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const calc=require("../synthetic-billing.js");
const makeBase=()=>({fixture:true,period:"2025",houseWater:70,
  units:[
    {id:"A",area:40,people:2,days:365,active:true,waterStart:10,waterEnd:40,advance:20},
    {id:"B",area:60,people:1,days:365,active:true,waterStart:40,waterEnd:80,advance:30}
  ],
  costs:[{id:"K",name:"Muster",amount:201.01,landlordShare:3.88,method:"Fläche"}]});
const make=()=>{const x=makeBase();x.waterSettings={houseStart:0,houseEnd:70,houseStartDate:"2025-01-01",houseEndDate:"2025-12-30"};
 for(const u of x.units)u.waterMeters={
   cold:{start:u.waterStart,end:u.waterEnd-10,startDate:"2025-01-01",endDate:"2025-12-30"},
   hot:{start:0,end:10,startDate:"2025-01-01",endDate:"2025-12-30"}
 };return x;};
test("reject untagged real objects and other years",()=>{
  assert.throws(()=>calc.calculate({period:"2025",units:[],costs:[]}),/Synthetic/);
  assert.throws(()=>calc.calculate({...make(),period:"2024"}),/Synthetic/);
});
test("six canonical reference methods plus legacy demo alias work from the same cost editor",()=>{
  for(const method of calc.METHODS){
    const x=make();x.costs[0].method=method;
    const r=calc.calculate(x);
    assert.equal(r.totals.grossCostsCents,20101,method);
    assert.equal(r.totals.landlordCostsCents,388,method);
    assert.equal(r.totals.distributedCents,19713,method);
    assert.equal(r.totals.differenceCents,0,method);
    assert.equal(r.costs[0].referenceStatus,"Vollständig",method);
    assert.equal(r.readyForRealFinalization,false);
  }
});
test("person counts change person-day distribution",()=>{
  const x=make();x.costs[0].method="Personen";
  const a=calc.calculate(x).units[0].costCents;
  x.units[0].people=1;
  assert.ok(calc.calculate(x).units[0].costCents<a);
});
test("meter differences do not disappear into a tenant allocation",()=>{
  const x=make();x.costs[0].method="Verbrauch";x.houseWater=80;
  const r=calc.calculate(x);
  assert.ok(r.totals.differenceCents>0);
  assert.ok(r.issues.some(i=>i.code==="UNALLOCATED_REFERENCE"));
  assert.equal(r.valid,false);
});
test("negative meter, zero person basis and invalid owner amount block",()=>{
  const x=make();x.units[0].waterEnd=1;
  assert.ok(calc.calculate(x).issues.some(i=>i.code==="INVALID_WATER"));
  x.units[0].waterEnd=40;x.units.forEach(u=>u.people=0);x.costs[0].method="Personen";
  assert.ok(calc.calculate(x).issues.some(i=>i.code==="ZERO_BASIS"));
  x.costs[0].landlordShare=1000;
  assert.ok(calc.calculate(x).issues.some(i=>i.code==="INVALID_LANDLORD"));
});
test("cent remainder distribution stable and input immutable",()=>{
  assert.deepEqual(calc.proportionalCents([1/3,1/3,1/3],100),[34,33,33]);
  const x=make(),before=JSON.stringify(x),r=calc.calculate(x);
  assert.equal(JSON.stringify(x),before);
  assert.equal(r.totals.balanceCents,r.totals.distributedCents-r.totals.advancesCents);
});
test("inactive apartment does not participate in active-only cost",()=>{
  const x=make();x.units[1].active=false;
  x.costs[0].method="Verteilung nur auf aktive Wohneinheiten";
  const r=calc.calculate(x);
  assert.equal(r.units[1].costCents,0);
  assert.equal(r.units[0].costCents,19713);
});