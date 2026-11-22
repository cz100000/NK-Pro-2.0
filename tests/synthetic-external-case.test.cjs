"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const billing=require("../synthetic-case-billing.js");
const workflow=require("../synthetic-workflow.js");
const property=require("../synthetic-property.js");
function base(){
 let s=property.upgrade({fixture:true,period:"2025",houseWater:20,
  units:[{id:"U1",area:40,waterStart:0,waterEnd:10,advance:100},
   {id:"U2",area:60,waterStart:0,waterEnd:10,advance:200}],
  costs:[{id:"heat",name:"Externe Heizkosten",amount:153.88,landlordShare:3.88,
    method:"Externe Einzelabrechnung"}]});
 s.waterSettings={houseStart:0,houseEnd:20,houseStartDate:"2025-01-01",houseEndDate:"2025-12-30"};
 for(const u of s.units)u.waterMeters={
 cold:{start:0,end:6,startDate:"2025-01-01",endDate:"2025-12-30"},
 hot:{start:0,end:4,startDate:"2025-01-01",endDate:"2025-12-30"}};
 return workflow.upgrade(s);
}
test("external Techem Euro amounts are used exactly without a unit price",()=>{
 let s=base(),ids=s.tenancies.map(t=>t.id);
 s=workflow.setExternal(s,"heat",ids[0],60,12.5,"Techem DEMO");
 s=workflow.setExternal(s,"heat",ids[1],90,null,"Techem DEMO");
 const r=billing.calculate(s);
 assert.equal(r.valid,true);
 assert.equal(r.costs[0].price,null);
 assert.equal(r.totals.grossCostsCents,15388);
 assert.equal(r.totals.landlordCostsCents,388);
 assert.equal(r.totals.distributedCents,15000);
 assert.equal(r.tenants[0].costCents,6000);
 assert.equal(r.tenants[1].costCents,9000);
});
test("external missing and mismatching values are never spread over tenants or owner",()=>{
 let s=base(),ids=s.tenancies.map(t=>t.id);
 s=workflow.setExternal(s,"heat",ids[0],60,null,"DEMO");
 const r=billing.calculate(s);
 assert.equal(r.valid,false);
 assert.ok(r.issues.some(x=>x.code==="EXTERNAL_CASES_MISSING"));
 assert.ok(r.issues.some(x=>x.code==="EXTERNAL_TOTAL_MISMATCH"));
 assert.equal(r.tenants[0].costCents,6000);
 assert.equal(r.tenants[1].costCents,0);
 assert.equal(r.totals.differenceCents,9000);
 assert.equal(r.totals.landlordCostsCents,388);
});
test("actual payments supersede legacy per-tenancy advance, source remains unchanged",()=>{
 let s=base(),ids=s.tenancies.map(t=>t.id);
 s=workflow.setExternal(s,"heat",ids[0],60,null,"DEMO");
 s=workflow.setExternal(s,"heat",ids[1],90,null,"DEMO");
 s=workflow.setPayment(s,ids[0],{mode:"monthly",agreed:10,paid:77});
 const r=billing.calculate(s);
 assert.equal(r.tenants[0].advanceCents,7700);
 assert.equal(r.tenants[0].balanceCents,-1700);
 assert.equal(s.tenancies[0].advance,100);
});
