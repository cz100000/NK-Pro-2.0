"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const e=require("../synthetic-estate.js"),p=require("../synthetic-property.js"),
 w=require("../water-detail.js"),wf=require("../synthetic-workflow.js");
function make(){return e.create(wf.example(p.upgrade(w.example({
 fixture:true,period:"2025",houseWater:140,
 units:Array.from({length:7},(_,i)=>({id:"DEMO-W0"+(i+1),
 label:"Wohnung "+(i+1),area:60+i*5,waterStart:100+i*30,
 waterEnd:120+i*30,advance:2000,people:1})),
 costs:[{id:"water",amount:1200,method:"Verbrauch"},
 {id:"heat",amount:5000,method:"Fläche"}]
}))));}
test("0.10 migration yields canonical, deterministic water/electricity/Techem registry on all units",()=>{
 const old=make();
 for(const o of old.objects)delete o.meterRegistry;
 const original=old.objects.map(o=>JSON.stringify(o.settlements));
 const p=e.upgradePortfolio(old);
 assert.equal(p.objects.reduce((n,o)=>n+o.meterRegistry.length,0),12*5);
 p.objects.forEach((o,i)=>{
   assert.equal(JSON.stringify(o.settlements),original[i]);
   for(const u of o.units){
     const meters=o.meterRegistry.filter(m=>m.unitId===u.id);
     assert.equal(meters.length,5);
     assert.deepEqual(meters.map(m=>m.type),["cold","hot","electricity","heat","heat"]);
     assert.equal(meters[0].number,u.meters.cold);
     assert.equal(meters[1].number,u.meters.hot);
     assert.equal(meters[2].status,"placeholder");
     assert.ok(meters.slice(3).every(m=>m.status==="placeholder"&&m.room));
     assert.equal(new Set(meters.map(m=>m.id)).size,5);
   }
 });
 assert.equal(JSON.stringify(e.upgradePortfolio(p)),JSON.stringify(p));
});
test("0.10 create/edit/retire/delete an unused meter with revision and annual preservation",()=>{
 let p=make(),id="SYN-MTR-"+encodeURIComponent("DEMO-W01")+"-STROM",
   baseline=JSON.stringify(p.objects[0].settlements),rev=p.objects[0].revision;
 p=e.editMeter(p,"SYN-A",id,{unitId:"DEMO-W01",type:"electricity",
   number:"DEMO-E-001",room:"Flur",radiator:"",
   status:"active",installedOn:"2024-01-01",removedOn:null,note:"Muster"});
 assert.equal(p.objects[0].revision,rev+1);
 assert.equal(p.objects[0].meterRegistry.find(m=>m.id===id).status,"active");
 assert.equal(JSON.stringify(p.objects[0].settlements),baseline);
 assert.throws(()=>e.addMeter(p,"SYN-A",{unitId:"DEMO-W01",type:"electricity",
   number:"DEMO-E-001",status:"active"}),/bereits/);
 p=e.retireMeter(p,"SYN-A",id);
 assert.equal(p.objects[0].meterRegistry.find(m=>m.id===id).status,"retired");
 p=e.deleteUnusedMeter(p,"SYN-A",id);
 assert.equal(p.objects[0].meterRegistry.some(m=>m.id===id),false);
 p=e.addMeter(p,"SYN-A",{unitId:"DEMO-W01",type:"heat",
   number:"TEST-HKV-011",room:"Küche",radiator:"Heizkörper 3",status:"active"});
 assert.equal(p.objects[0].meterRegistry.find(m=>m.number==="TEST-HKV-011").room,"Küche");
 assert.equal(JSON.stringify(p.objects[0].settlements),baseline);
 const record=e.syncSnapshot(p).records.find(r=>r.key==="object/SYN-A");
 assert.ok(record.payload.meterRegistry.some(m=>m.number==="TEST-HKV-011"));
});
test("0.10 historical water meter is never deleted or rewritten; replacement is explicit",()=>{
 let p=make();
 const old=JSON.stringify(p.objects[0].settlements);
 const original=p.objects[0].meterRegistry.find(m=>m.unitId==="DEMO-W01"&&m.type==="cold");
 assert.ok(e.meterReferenced(p.objects[0],original));
 assert.throws(()=>e.deleteUnusedMeter(p,"SYN-A",original.id),/referenziert/);
 assert.throws(()=>e.editMeter(p,"SYN-A",original.id,{
   ...original,number:"DIFFERENT"}),/referenziert/);
 assert.throws(()=>e.addMeter(p,"SYN-A",{unitId:"DEMO-W01",type:"cold",
   number:"DEMO-NEW-KW",status:"active"}),/bereits ein aktiver/);
 p=e.retireMeter(p,"SYN-A",original.id);
 assert.equal(p.objects[0].meterRegistry.find(m=>m.id===original.id).status,"retired");
 assert.equal(JSON.stringify(p.objects[0].settlements),old);
 assert.throws(()=>e.addYear(p,"SYN-A","2026"),/aktive KW-/);
 p=e.addMeter(p,"SYN-A",{unitId:"DEMO-W01",type:"cold",number:"DEMO-NEW-KW",
   status:"active",installedOn:"2026-01-01"});
 assert.equal(p.objects[0].units[0].meters.cold,"DEMO-NEW-KW");
 p=e.addYear(p,"SYN-A","2026");
 assert.equal(p.objects[0].settlements["2026"].units[0].waterMeters.cold.number,"DEMO-NEW-KW");
 assert.equal(JSON.stringify(Object.fromEntries(Object.entries(p.objects[0].settlements)
   .filter(([year])=>year!=="2026"))),old);
});
test("0.10 meter validations reject wrong room, forged unit, wrong dates and moved identity",()=>{
 const p=make(),o=p.objects[0],m=o.meterRegistry[0];
 assert.throws(()=>e.addMeter(p,o.id,{unitId:"fake",type:"heat",room:"Wohnzimmer",
   status:"placeholder"}),/ungültig/);
 assert.throws(()=>e.addMeter(p,o.id,{unitId:o.units[0].id,type:"heat",
   status:"placeholder"}),/Raum/);
 assert.throws(()=>e.addMeter(p,o.id,{unitId:o.units[0].id,type:"electricity",
   number:"X",status:"active",installedOn:"2027-01-01",removedOn:"2026-01-01"}),/ungültig/);
 assert.throws(()=>e.editMeter(p,o.id,m.id,{...m,unitId:o.units[1].id}),/stabile Zähler-ID/);
 assert.equal(o.meterRegistry[0].status,"active");
});
