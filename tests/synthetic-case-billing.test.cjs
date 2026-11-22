"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const property=require("../synthetic-property.js");
const billing=require("../synthetic-case-billing.js");
const make=()=>{
 const x=property.upgrade({fixture:true,period:"2025",houseWater:80,
 units:[{id:"A",label:"A",area:40,active:true,people:1,advance:200,waterStart:0,waterEnd:40},
 {id:"B",label:"B",area:60,active:true,people:1,advance:300,waterStart:0,waterEnd:40}],
 costs:[{id:"water",name:"Wasser",amount:800,landlordShare:0,method:"Verbrauch"},
 {id:"area",name:"Fläche",amount:600,landlordShare:0,method:"Fläche"}]});
 x.waterSettings={houseStart:0,houseEnd:80,houseStartDate:"2025-01-01",houseEndDate:"2025-12-30"};
 for(const u of x.units)u.waterMeters={
  cold:{start:0,end:20,startDate:"2025-01-01",endDate:"2025-12-30"},
  hot:{start:0,end:20,startDate:"2025-01-01",endDate:"2025-12-30"}};
 return x;
};
test("synthetic-only independent annual tenancy settlement",()=>{
 assert.throws(()=>billing.calculate({period:"2025",units:[],costs:[],tenancies:[]}),/Synthetic/);
 const x=make(),before=JSON.stringify(x),r=billing.calculate(x);
 assert.equal(JSON.stringify(x),before);
 assert.equal(r.tenants.length,2);
 assert.equal(r.issues.length,0);
 assert.equal(r.valid,true);
 assert.equal(r.totals.grossCostsCents,140000);
 assert.equal(r.totals.distributedCents,140000);
 assert.equal(r.totals.advancesCents,50000);
 assert.equal(r.readyForRealFinalization,false);
});
test("private settlement participant shares all costs",()=>{
 const x=make();x.tenancies[1].role="Privatanteil";
 const r=billing.calculate(x);
 assert.equal(r.valid,true);
 assert.ok(r.tenants[1].costCents>0);
});
test("two occupancy cases on same unit billed independently with matched KW/WW",()=>{
 const x=make(),first=x.tenancies[0];first.end="2025-06-30";first.advance=90;
 x.tenancies.push({id:"T-NEW",unitId:"A",name:"Musterperson neu",start:"2025-07-01",
 end:"2025-12-31",persons:2,role:"Mieter",advance:150,consumptionCold:7,consumptionHot:8});
 first.consumptionCold=13;first.consumptionHot=12;
 const r=billing.calculate(x);
 assert.equal(r.issues.length,0);
 assert.equal(r.tenants.length,3);
 assert.equal(r.units.length,2);
 assert.equal(r.totals.distributedCents,140000);
 assert.equal(r.tenants.filter(t=>t.unitId==="A").reduce((s,t)=>s+t.costCents,0),r.units[0].costCents);
 assert.equal(r.tenants.find(t=>t.id==="T-NEW").advanceCents,15000);
 assert.equal(r.occupancy.vacancyDays,0);
});
test("missing split or overlapping occupancy never creates valid totals",()=>{
 const x=make();x.tenancies.push({id:"T-X",unitId:"A",name:"X",start:"2025-06-01",
 end:"2025-12-31",persons:1,role:"Mieter",advance:0});
 const r=billing.calculate(x);
 assert.equal(r.valid,false);
 assert.ok(r.issues.some(z=>z.code==="OVERLAPPING_TENANCIES"));
 assert.ok(r.issues.some(z=>z.code==="CASE_WATER_SPLIT_MISSING"));
});
test("non-water consumption cost requires its own invoice and case inputs",()=>{
 const x=make();x.costs.push({id:"electricity",name:"Strom",amount:200,method:"Verbrauch",consumptionTotal:100});
 const bad=billing.calculate(x);
 assert.ok(bad.issues.some(z=>z.code==="COST_CONSUMPTION_CASES"));
 x.costs[2].consumptionByTenant=Object.fromEntries(x.tenancies.map(t=>[t.id,50]));
 const ok=billing.calculate(x);
 assert.equal(ok.issues.length,0);
 assert.equal(ok.totals.distributedCents,160000);
});
test("owner remainder stays visible instead of becoming a tenant cost",()=>{
 const x=make();x.houseWater=100;
 const r=billing.calculate(x);
 assert.equal(r.valid,false);
 assert.equal(r.totals.differenceCents,16000);
 assert.ok(r.issues.some(z=>z.code==="UNALLOCATED_REFERENCE"));
});
test("exclusions preserve original owner/non-owner distinction",()=>{
 const x=make();x.costs[1].exclusionMode="owner";x.costs[1].excludedTenantIds=[x.tenancies[1].id];
 const r=billing.calculate(x);
 assert.equal(r.valid,false);
 assert.ok(r.costs[1].notAllocatedCents>0);
 assert.ok(r.tenants[0].costCents>0);
});
