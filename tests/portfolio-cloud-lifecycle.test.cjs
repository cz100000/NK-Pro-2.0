"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const e=require("../synthetic-estate.js"),p=require("../synthetic-property.js"),
 w=require("../water-detail.js"),wf=require("../synthetic-workflow.js");
const make=()=>e.create(wf.example(p.upgrade(w.example({
 fixture:true,period:"2025",houseWater:140,
 units:Array.from({length:7},(_,i)=>({id:"DEMO-W0"+(i+1),label:"Wohnung "+(i+1),
 area:60+i*5,waterStart:100+i*30,waterEnd:120+i*30,advance:2000,people:1})),
 costs:[{id:"water",amount:1200,method:"Verbrauch"},{id:"heat",amount:5000,method:"Fläche"}]
}))));
test("0.9 upgrades stored 0.7 portfolios without changing master IDs or annual payloads",()=>{
 const x=make(),old=JSON.parse(JSON.stringify(x));
 delete old.sync;delete old.tombstones;
 for(const o of old.objects){delete o.sync;delete o.lifecycle;
   for(const a of Object.values(o.settlements))delete a.sync;}
 const orig=old.objects.map(o=>({id:o.id,units:o.units.map(u=>u.id),
   tenancies:o.tenancies.map(t=>t.id),annual:JSON.stringify(o.settlements)}));
 const next=e.upgradePortfolio(old);
 assert.equal(next.sync.format,2);
 next.objects.forEach((o,i)=>{
   assert.equal(o.id,orig[i].id);
   assert.deepEqual(o.units.map(u=>u.id),orig[i].units);
   assert.deepEqual(o.tenancies.map(t=>t.id),orig[i].tenancies);
   const annual=JSON.parse(JSON.stringify(o.settlements));
   for(const a of Object.values(annual))delete a.sync;
   assert.equal(JSON.stringify(annual),orig[i].annual);
 });
 assert.equal(e.current(next).period,"2025");
});
test("0.9 creates stable IDs, new unit, tenancy and synthetic annual without touching other years",()=>{
 const base=make(),frozen=JSON.stringify(base.objects[0].settlements["2024"]);
 let x=e.addObject(base,{name:"Musterobjekt D",street:"Demoweg 3",postalCode:"00004",city:"Musterstadt"});
 const id=x.selectedObjectId;
 assert.match(id,/^SYN-OBJ-/);assert.equal(x.selectedYear,null);assert.equal(e.current(x),null);
 assert.throws(()=>e.addYear(x,id,"2025"),/Wohnungen/);
 x=e.addUnit(x,id,{label:"Wohnung D1",position:"EG links",area:55});
 const u=x.objects.find(o=>o.id===id).units[0];
 assert.match(u.id,/^SYN-W-/);assert.match(u.meters.cold,/^DEMO-KW-/);
 x=e.editMaster(x,id,"tenancy",{id:"SYN-T-D1",unitId:u.id,firstName:"Eva",
   lastName:"Beispiel",leaseStart:"2023-01-01",leaseEnd:null,persons:1,
   salutation:"neutral",role:"Mieter"});
 x=e.addYear(x,id,"2025");
 assert.equal(e.current(x).period,"2025");assert.equal(e.readonly(e.current(x)),false);
 assert.throws(()=>e.addYear(x,id,"2025"),/bereits vorhanden/);
 assert.equal(JSON.stringify(x.objects[0].settlements["2024"]),frozen);
 assert.throws(()=>e.deleteEmptyObject(x,id),/Nur archivieren/);
});
test("0.9 archive/restore preserves data; deleting only empty object produces tombstone",()=>{
 let x=make(),before=JSON.stringify(x.objects[0].settlements),oldId=x.objects[0].id;
 x=e.archiveObject(x,oldId);
 assert.equal(x.objects[0].lifecycle.status,"archived");
 assert.equal(x.selectedObjectId,"SYN-B");
 assert.throws(()=>e.selectObject(x,oldId),/archiviert/);
 assert.equal(JSON.stringify(x.objects[0].settlements),before);
 x=e.restoreObject(x,oldId);
 assert.equal(x.objects[0].lifecycle.status,"active");
 let p=e.addObject(x,{name:"Leer",street:"Testweg 1",postalCode:"00005",city:"Musterdorf"});
 const id=p.selectedObjectId;
 p=e.deleteEmptyObject(p,id);
 assert.ok(!p.objects.some(o=>o.id===id));
 assert.ok(p.tombstones.some(t=>t.id===id));
 assert.ok(e.syncSnapshot(p).records.some(r=>r.key==="object/"+id&&r.payload.deleted));
});
test("0.9 independent annual/master sync versions and three-way conflict detection",()=>{
 const base=make(),common=e.syncSnapshot(base);
 let local=e.saveYear(base,"SYN-A","2025",e.current(base));
 let plan=e.planSync(common,e.syncSnapshot(local),common);
 assert.ok(plan.upload.includes("annual/SYN-A/2025"));
 assert.ok(!plan.upload.includes("object/SYN-A"));
 assert.ok(plan.canApply);
 const other=e.editMaster(base,"SYN-A","property",{
   name:"Version Remote",street:"Beispielstraße 17",postalCode:"00001",city:"Musterstadt"});
 local=e.editMaster(local,"SYN-A","property",{
   name:"Version Local",street:"Beispielstraße 17",postalCode:"00001",city:"Musterstadt"});
 plan=e.planSync(common,e.syncSnapshot(local),e.syncSnapshot(other));
 assert.ok(plan.conflicts.includes("object/SYN-A"));
 assert.equal(plan.canApply,false);
 assert.ok(e.syncSnapshot(local).records.some(x=>x.key==="annual/SYN-A/2024"));
});
