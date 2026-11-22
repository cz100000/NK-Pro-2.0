"use strict";
/* Synthetic joint stage-3/4 E2E gate: never confuse draft with print-ready. */
const {test}=require("node:test"),assert=require("node:assert/strict");
const property=require("../synthetic-property.js"),water=require("../water-detail.js"),
  workflow=require("../synthetic-workflow.js"),calc=require("../synthetic-case-billing.js"),
  review=require("../synthetic-review.js"),letters=require("../synthetic-letters.js");
function fixture(){
 let d=property.upgrade({fixture:true,period:"2025",houseWater:100,
  units:[{id:"S-W01",label:"Wohnung A",area:60,advance:200,waterStart:0,waterEnd:50},
    {id:"S-W02",label:"Wohnung B",area:80,advance:300,waterStart:0,waterEnd:50}],
  costs:[{id:"waste",name:"Müll",amount:300,method:"Fläche"},
    {id:"heat",name:"Techem",amount:503.88,landlordShare:3.88,method:"Externe Einzelabrechnung"}]});
 d.waterSettings={houseStart:0,houseEnd:100,houseStartDate:"2025-01-01",houseEndDate:"2025-12-30"};
 for(const u of d.units)u.waterMeters={
   cold:{start:0,end:30,startDate:"2025-01-01",endDate:"2025-12-30"},
   hot:{start:0,end:20,startDate:"2025-01-01",endDate:"2025-12-30"}};
 d=workflow.upgrade(d);
 d=workflow.setExternal(d,"heat",d.tenancies[0].id,200,12.5,"DEMO-EINZELKOSTEN");
 d=workflow.setExternal(d,"heat",d.tenancies[1].id,300,19.25,"DEMO-EINZELKOSTEN");
 d=workflow.setPayment(d,d.tenancies[0].id,{mode:"monthly",agreed:20,paid:190});
 d=workflow.setPayment(d,d.tenancies[1].id,{mode:"annual",agreed:300,paid:290});
 d.tenancies[1].role="Privatanteil";
 return d;
}
test("stages 3+4 use same identities/costs/payments/letters and block unported rules",()=>{
 const x=fixture(),before=JSON.stringify(x),b=calc.calculate(x);
 assert.equal(JSON.stringify(x),before);
 assert.equal(b.valid,true);
 assert.equal(b.totals.grossCostsCents,80388);
 assert.equal(b.totals.landlordCostsCents,388);
 assert.equal(b.totals.distributedCents,80000);
 assert.equal(b.totals.advancesCents,48000);
 assert.ok(b.tenants[1].costCents>0,"Privatanteil must be billed");
 const bundle=letters.make(x,b),q=review.assess(x,b,bundle);
 assert.equal(bundle.letters.length,2);
 for(const t of b.tenants){
   const letter=bundle.letters.find(l=>l.id===t.id);
   assert.equal(letter.costCents,t.costCents);
   assert.equal(letter.paidCents,t.advanceCents);
   assert.equal(letter.balanceCents,t.balanceCents);
 }
 assert.equal(q.counts.total,44);
 assert.equal(q.counts.notRun,34);
 assert.equal(q.readyForClose,false);
 assert.equal(bundle.readyForPrint,false);
});
test("mismatched external costs never silently become tenant or owner allocations",()=>{
 const d=fixture();d.externalValues.heat.rows[d.tenancies[1].id].amount=270;
 const b=calc.calculate(d),lettersOut=letters.make(d,b),q=review.assess(d,b,lettersOut);
 assert.equal(b.valid,false);
 assert.ok(b.issues.some(x=>x.code==="EXTERNAL_TOTAL_MISMATCH"));
 assert.equal(b.totals.differenceCents,3000);
 assert.equal(b.totals.landlordCostsCents,388);
 assert.ok(q.counts.critical>0);
});
