"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const p=require("../synthetic-property.js");
const water=require("../water-detail.js");
function sample(){
 const x={fixture:true,period:"2025",houseWater:80,
 units:[{id:"U1",area:40,waterStart:10,waterEnd:50,people:2,advance:900},
   {id:"U2",area:60,waterStart:20,waterEnd:60,people:1,advance:1200}],
 costs:[{id:"W",name:"Muster",method:"Verbrauch",amount:800}]};
 const a=p.upgrade(x);
 a.units[0].waterMeters={cold:{start:0,end:20,startDate:"2025-01-01",endDate:"2025-12-30"},
 hot:{start:0,end:20,startDate:"2025-01-01",endDate:"2025-12-30"}};
 a.units[1].waterMeters={cold:{start:0,end:20,startDate:"2025-01-01",endDate:"2025-12-30"},
 hot:{start:0,end:20,startDate:"2025-01-01",endDate:"2025-12-30"}};
 return a;
}
test("only synthetic 2025 input, preserving original snapshot",()=>{
 assert.throws(()=>p.upgrade({units:[],costs:[],period:"2025"}),/Synthetic/);
 const a=sample(),copy=JSON.stringify(a),r=p.upgrade(a);
 assert.equal(JSON.stringify(a),copy);
 assert.equal(r.tenancies.length,2);
 assert.equal(r.tenancies[0].days,undefined);
});
test("two non-overlapping tenancies on one apartment produce two cases and vacancy",()=>{
 const x=sample();
 x.tenancies[0].end="2025-06-30";
 x.tenancies.push({id:"SYN-T3",unitId:"U1",name:"Musterperson X",start:"2025-07-15",end:"2025-12-31",
 persons:1,role:"Mieter",advance:600,consumptionCold:8,consumptionHot:10});
 x.tenancies[0].consumptionCold=12;x.tenancies[0].consumptionHot=10;
 // Build dated evidence for zero vacancy rather than typing synthetic vacancy amounts.
 for(const kind of ["cold","hot"]){
   const m=x.units[0].waterMeters[kind];
   m.interimReadings=[{date:"2025-06-30",value:10},{date:"2025-07-15",value:10}];
 }
 const r=p.inspect(x,water.diagnostics(x));
 assert.equal(r.issues.length,0);
 assert.equal(r.cases.length,3);
 assert.equal(r.cases[0].days,181);
 assert.equal(r.vacancy.find(v=>v.unitId==="U1").days,14);
 assert.equal(r.cases.find(t=>t.id==="SYN-T3").consumption,18);
});
test("overlap and missing consumption split block",()=>{
 const x=sample();x.tenancies[0].end="2025-08-01";
 x.tenancies.push({id:"SYN-T3",unitId:"U1",name:"Muster X",start:"2025-07-01",end:"2025-12-31",
 persons:1,role:"Mieter",advance:0});
 const r=p.inspect(x,water.diagnostics(x));
 assert.ok(r.issues.some(x=>x.code==="OVERLAPPING_TENANCIES"));
 assert.ok(r.issues.some(x=>x.code==="CASE_WATER_SPLIT_MISSING"));
});
test("private role is a full participant with money and measured quantities",()=>{
 const x=sample();x.tenancies[1].role="Privatanteil";
 const r=p.inspect(x,water.diagnostics(x));
 assert.equal(r.cases.length,2);
 assert.equal(r.cases[1].consumption,40);
 assert.equal(r.cases[1].advance,1200);
 assert.equal(r.valid,true);
});
test("undocumented consumption split cannot allocate more or less than physical readings",()=>{
 const x=sample();x.tenancies[0].end="2025-06-30";
 x.tenancies.push({id:"SYN-T3",unitId:"U1",name:"X",start:"2025-07-01",end:"2025-12-31",
 persons:1,role:"Mieter",advance:0,consumptionCold:6,consumptionHot:6});
 x.tenancies[0].consumptionCold=7;x.tenancies[0].consumptionHot=7;
 assert.ok(p.inspect(x,water.diagnostics(x)).issues.some(z=>z.code==="CASE_WATER_MISMATCH"));
});
test("update preserves identity and validates required fields",()=>{
 const x=sample(),before=JSON.stringify(x);
 const n=p.updateTenancy(x,{...x.tenancies[0],name:"X",start:"2025-01-10",end:"2025-12-31"});
 assert.equal(n.tenancies[0].name,"X");
 assert.equal(JSON.stringify(x),before);
 assert.throws(()=>p.updateTenancy(x,{...x.tenancies[0],end:"2025-02-30"}),/Complete/);
});

test("single tenancy with vacancy and measured consumption cannot silently receive all water",()=>{
 const x=sample();x.tenancies[0].end="2025-11-30";
 let r=p.inspect(x,water.diagnostics(x));
 assert.ok(r.issues.some(i=>i.code==="VACANCY_WATER_ATTRIBUTION_REQUIRED"));
 x.tenancies[0].consumptionCold=19;x.tenancies[0].consumptionHot=19;
 for(const kind of ["cold","hot"]){
   x.units[0].waterMeters[kind].interimReadings=[{date:"2025-11-30",value:19}];
   x.units[0].waterMeters[kind].endDate="2025-12-31";
 }
 r=p.inspect(x,water.diagnostics(x));
 assert.equal(r.valid,true);
 assert.equal(r.cases[0].consumption,38);
 assert.ok(r.vacancy.some(v=>v.unitId==="U1"&&v.days===31));
});
