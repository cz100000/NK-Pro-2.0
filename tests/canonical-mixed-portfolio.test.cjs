"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const estates=require("../synthetic-estate.js");
const old=require("../private/private-model.js");
globalThis.NKPRO2_PRIVATE_MODEL=old;
const migration=require("../integrated-data.js");
globalThis.NKPRO2_INTEGRATED_DATA=migration;
const adapter=require("../portfolio-view-model.js");
const tree=require("../navigation-tree.js");
const {source}=require("./integrated-real-master.test.cjs");
const clone=x=>JSON.parse(JSON.stringify(x));
function fakePortfolio(){
 const units=Array.from({length:7},(_,i)=>({
  id:"PLACEHOLDER-"+i,label:"Sample "+i,position:"EG",area:60,
  meters:{cold:"KW-"+i,hot:"WW-"+i}}));
 return estates.create({fixture:true,period:"2025",units,tenancies:[],
  costs:[],payments:{},settlement:{status:"draft"},property:{},waterSettings:{}});
}
function combo(){
 const fake=fakePortfolio(),live=migration.migrate(source());
 return {fake,live,projection:adapter.compose(fake,live)};
}
test("Single v0.13 object/year contract: only sample A is replaced by real object, B/C are byte-identical",()=>{
 const {fake,live,projection}=combo(),original=clone(fake);
 assert.equal(projection.objects.length,3);
 assert.equal(projection.objects[0].id,live.objects[0].id);
 assert.equal(projection.objects[0].sourceKind,"real");
 assert.equal(projection.objects[0].units.length,7);
 assert.equal(projection.objects[0].tenancies.length,5);
 assert.deepEqual(projection.objects.slice(1),original.objects.slice(1));
 assert.deepEqual(fake,original,"The original sample portfolio was not changed in memory");
 assert.deepEqual(Object.keys(projection.objects[0].settlements).sort(),
  ["2025","2024","2023","2022","2021/2022"].sort());
});
test("Historical 2023 retains both immutable separate snapshots; only one 2023 calendar-tree item",()=>{
 const {projection}=combo(),o=projection.objects[0];
 assert.equal(o.settlements["2023"].archivedOriginals.length,2);
 assert.notEqual(o.settlements["2023"].archivedOriginals[0].id,
  o.settlements["2023"].archivedOriginals[1].id);
 const ui={view:"billing",billingHome:false,objectTab:"overview",
  treeOpenObjectId:o.id,treeSections:{master:true,years:true}};
 projection.selectedObjectId=o.id;projection.selectedYear="2023";
 const html=tree.render(projection,ui,{mode:"real"});
 assert.equal((html.match(/class="tree-year[^"]*"/g)||[]).length,5,
  "Five ARB5 calendar years; B/C collapsed in the original tree");
 assert.equal((html.match(/<span class="tree-year-name">/g)||[]).length,5);
 assert.equal((html.match(/<span class="tree-group-label">Jahresabrechnungen/g)||[]).length,1);
 assert.ok(html.includes('data-action="open-year"'));
 assert.ok(html.includes('data-action="toggle-tree-section"'));
 assert.ok(html.includes('aria-expanded="true"'));
 assert.ok(html.includes('tree-property-label'));
 assert.ok(html.includes('<svg viewBox="0 0 24 24"'));
 assert.ok(!html.includes("nk-live-tree"));
});
test("Original 0.13 green tree renders sample portfolio unchanged when no real data exists",()=>{
 const fake=fakePortfolio(),projection=adapter.compose(fake,null);
 const ui={view:"object",objectTab:"overview",billingHome:true,
  treeOpenObjectId:"SYN-A",treeSections:{master:false,years:true}};
 assert.deepEqual(projection,fake);
 const html=tree.render(projection,ui,{mode:"demo"});
 assert.ok(html.includes("Musterobjekt A"));
 assert.ok(html.includes("Musterobjekt B"));
 assert.ok(html.includes("Musterobjekt C"));
 assert.ok(html.includes("tree-property-button"));
 assert.ok(html.includes("tree-year"));
 assert.ok(html.includes("tree-group-toggle"));
 assert.ok(html.includes("Ausschließlich fiktive Musterobjekte."));
});
test("New 2025 annual is a read-only blank v2 draft, no legacy amounts or fake source calculation",()=>{
 const {projection,live}=combo(),o=projection.objects[0],y=o.settlements["2025"];
 assert.equal(y.fixture,false);
 assert.equal(y.source,"nkpro2-new-year");
 assert.equal(y.settlement.readOnly,true);
 assert.deepEqual(y.costs,[]);
 assert.deepEqual(y.payments,{});
 assert.deepEqual(y.units,[]);
 assert.deepEqual(y.tenancies,[]);
 assert.equal(live.objects[0].annual["2025"].costs.length,0);
 assert.ok(!JSON.stringify(o.settlements["2025"]).includes("K006"));
});
test("Both original and genuine object models remain intact when view adapter called repeatedly",()=>{
 const {fake,live}=combo(),a=clone(fake),b=clone(live);
 for(let i=0;i<4;i++)adapter.compose(fake,live);
 assert.deepEqual(fake,a);assert.deepEqual(live,b);
});
