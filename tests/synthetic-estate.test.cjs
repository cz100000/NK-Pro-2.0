"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const e=require("../synthetic-estate.js"),p=require("../synthetic-property.js"),
 w=require("../water-detail.js"),wf=require("../synthetic-workflow.js"),
 b=require("../synthetic-case-billing.js");
function old(){return wf.example(p.upgrade(w.example({fixture:true,period:"2025",houseWater:140,
 units:Array.from({length:7},(_,i)=>({id:"DEMO-W0"+(i+1),label:"Wohnung "+(i+1),area:60+i*5,
 waterStart:100+i*30,waterEnd:120+i*30,advance:2000,people:1})),
 costs:[{id:"water",amount:1200,method:"Verbrauch"},{id:"heat",amount:5000,method:"Fläche"}]})));}
const make=()=>e.create(old());
test("three independent permanent objects and 7/3/2 units, six years 23/24 plus 2025 A",()=>{
 const x=make();assert.deepEqual(x.objects.map(o=>o.units.length),[7,3,2]);
 assert.equal(x.objects.reduce((s,o)=>s+Object.keys(o.settlements).length,0),7);
 assert.deepEqual(x.objects.map(o=>Object.keys(o.settlements).sort()),
 [["2023","2024","2025"],["2023","2024"],["2023","2024"]]);
 assert.equal(e.current(x).period,"2025");
});
test("genuine 2023/24 calendar period in six synthetic bills, no cross-object contamination",()=>{
 const x=make();
 for(const o of x.objects)for(const year of ["2023","2024"]){
   const a=o.settlements[year],r=b.calculate(a);
   assert.equal(a.period,year);
   assert.equal(r.tenants.length,a.tenancies.length);
   assert.ok(r.totals.grossCostsCents>0);
   assert.equal(r.water.delta.invoiceHouse,0);
   assert.equal(e.readonly(a),true);
 }
});
test("2024 B mid-year switch and dated 14-day vacancy matches interim KW/WW readings",()=>{
 const x=make(),o=x.objects[1],a=o.settlements["2024"],id=o.units[1].id;
 const cases=a.tenancies.filter(t=>t.unitId===id);
 assert.equal(cases.length,2);assert.equal(cases[0].end,"2024-06-30");
 assert.equal(cases[1].start,"2024-07-15");
 const r=b.calculate(a),vac=r.occupancy.vacancy.find(v=>v.unitId===id);
 assert.equal(vac.days,14);
 assert.equal(w.vacancyFromReadings(a)[id].cold,2);
 assert.equal(w.vacancyFromReadings(a)[id].hot,1);
});
test("master changes leave annual snapshots untouched until explicit draft rebase",()=>{
 const x=make(),before=JSON.stringify(x.objects[0].settlements);
 const o=x.objects[0],t=o.tenancies[0];
 const y=e.editMaster(x,o.id,"tenancy",{...t,lastName:"Muster",leaseEnd:"2025-11-30"});
 assert.equal(JSON.stringify(y.objects[0].settlements),before);
 assert.equal(e.rebasePreview(y,o.id,"2025").stale,true);
 assert.throws(()=>e.rebaseDraft(y,o.id,"2024"),/read-only/);
 const z=e.rebaseDraft(y,o.id,"2025");
 assert.equal(z.objects[0].settlements["2025"].tenancies[0].end,"2025-11-30");
 assert.equal(z.objects[0].settlements["2025"].reviewInvalidated,true);
});
test("object and year switching does not mutate other selected contexts",()=>{
 const x=make(),b=e.selectObject(x,"SYN-B"),c=e.selectYear(b,"SYN-C","2023");
 assert.equal(e.current(b).period,"2024");
 assert.equal(e.current(c).period,"2023");
 assert.equal(e.current(x).period,"2025");
 assert.deepEqual(e.validate(JSON.parse(JSON.stringify(c))),c);
 assert.throws(()=>e.selectYear(x,"SYN-B","2025"),/Unknown/);
});
test("master validation rejects tenure overlaps and bad units",()=>{
 const x=make(),o=x.objects[1],t=o.tenancies[1];
 assert.throws(()=>e.editMaster(x,o.id,"tenancy",{...t,leaseEnd:null}),/Overlapping/);
 assert.throws(()=>e.editMaster(x,o.id,"unit",{id:"missing",area:10}),/Apartment/);
 assert.equal(x.objects[0].tenancies[0].leaseEnd,null);
 assert.throws(()=>e.validate({schema:"fake",fixture:true,objects:[]}),/synthetic/);
});
