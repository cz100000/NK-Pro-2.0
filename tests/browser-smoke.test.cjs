"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=path.resolve(__dirname,"..");
function browser(store=new Map()){
 const handlers={},elements=new Map();
 const navs=["overview","billing","object","analytics","documents"].map(view=>({
  dataset:{view},classList:{toggle(){},remove(){},add(){}},setAttribute(){},removeAttribute(){}}));
 function node(id){if(!elements.has(id))elements.set(id,{id,innerHTML:"",textContent:"",hidden:id==="drawer",
  style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},isConnected:true,
  addEventListener(evt,fn){handlers[id+":"+evt]=fn},focus(){},
  querySelectorAll(){return []},querySelector(){return null}
 });return elements.get(id)}
 const doc={body:{style:{},classList:{remove(){},add(){},toggle(){}}},
  getElementById:node,querySelectorAll(sel){return sel===".nav-item"?navs:[]},
  addEventListener(evt,fn){handlers[evt]=fn},activeElement:null};
 const win={document:doc,console,setTimeout(){return 0},clearTimeout(){},
  localStorage:{getItem(k){return store.get(k)||null},setItem(k,v){store.set(k,v)}},
  scrollTo(){},confirm(){return true},print(){},Date,Intl,Math,JSON,Number,Set,Map,Error,
  Object,Array,String,Boolean,parseInt,parseFloat};
 win.window=win;win.globalThis=win;
 const ctx=vm.createContext(win,{name:"nkpro2-synthetic-estates"});
 const names=["demo-ledger.js","experimental/settlement-cost.js","water-detail.js",
   "synthetic-billing.js","synthetic-property.js","synthetic-workflow.js",
   "synthetic-case-billing.js","synthetic-letters.js","synthetic-review.js",
   "synthetic-estate.js","synthetic-master-ui.js","app.js"];
 for(const filename of names)vm.runInContext(fs.readFileSync(path.join(root,filename),"utf8"),
   ctx,{filename,timeout:5000});
 function click(selector,data){assert.ok(handlers.click);handlers.click({
   target:{closest(key){return key===selector?{dataset:data}:null}}});}
 function act(action,id=""){click("[data-action]",{action,id})}
 function save(values){
   const entries=Object.entries(values).map(([k,v])=>[k,{value:String(v),checked:Boolean(v)}]);
   const form={id:"editForm",elements:Object.fromEntries(entries),querySelectorAll(){return []}};
   handlers.submit({target:form,preventDefault(){}});
 }
 return{window:win,store,node,click,act,save,
  state:()=>win.NKPRO2_DEMO_TEST.getState(),
  portfolio:()=>win.NKPRO2_DEMO_TEST.getPortfolio(),
  html:()=>node("appMain").innerHTML,
  tree:()=>node("portfolioTree").innerHTML,
  drawer:()=>node("drawerBody").innerHTML,
  toast:()=>node("toast").textContent};
}
test("0.7 boots a genuine 3-property portfolio and a clear 7-year overview",()=>{
 const x=browser(),p=x.portfolio();
 assert.equal(p.objects.length,3);
 assert.deepEqual(p.objects.map(o=>o.units.length),[7,3,2]);
 assert.equal(p.objects.reduce((n,o)=>n+Object.keys(o.settlements).length,0),7);
 assert.match(x.html(),/Startseite/);
 assert.match(x.tree(),/Musterobjekt A/);
 assert.match(x.tree(),/Musterobjekt B/);
 assert.match(x.tree(),/Musterobjekt C/);
 x.act("object-billings","SYN-A");
 assert.match(x.html(),/Jahresabrechnungen/);
 assert.match(x.html(),/Abrechnung 2025/);
 assert.match(x.html(),/Abrechnung 2023/);
});
test("real click hierarchy B → master rooms → one unit → B/2024 → B/2023",()=>{
 const x=browser();x.act("select-property","SYN-B");
 assert.equal(x.portfolio().selectedObjectId,"SYN-B");
 assert.match(x.html(),/Objektdaten/);
 x.click("[data-object-tab]",{objectTab:"units"});
 assert.match(x.html(),/Wohnungen/);
 x.act("view-unit","SYN-B-W02");
 assert.match(x.html(),/Zählerstamm/);
 assert.match(x.html(),/SYN-B-T04/);
 x.act("back-units");
 x.click("[data-object-tab]",{objectTab:"tenancies"});
 assert.match(x.html(),/Nicht ausgezogen/);
 x.act("open-year","SYN-B|2024");
 assert.equal(x.state().period,"2024");
 assert.match(x.html(),/Abrechnung 2024/);
 assert.match(x.html(),/Vorauszahlungen/);
 assert.doesNotMatch(x.html(),/data-step="tenancies"/);
 const previous=JSON.stringify(x.portfolio().objects[1].settlements["2024"]);
 x.act("edit-payment","SYN-B-T04");
 assert.match(x.toast(),/schreibgeschützt/);
 assert.equal(JSON.stringify(x.portfolio().objects[1].settlements["2024"]),previous);
 x.act("open-year","SYN-B|2023");
 assert.equal(x.state().period,"2023");
 assert.equal(x.state().tenancies.length,3);
});
test("object C private tenant, only master changes are possible",()=>{
 const x=browser();x.act("select-property","SYN-C");
 x.click("[data-object-tab]",{objectTab:"tenancies"});
 assert.match(x.html(),/Privatanteil/);
 x.act("edit-master-tenancy","SYN-C-T02");
 assert.match(x.drawer(),/Auszugsdatum \(optional\)/);
 assert.match(x.drawer(),/Abweichende Zustellanschrift/);
 assert.doesNotMatch(x.drawer(),/Jahresvorauszahlung/);
});
test("changing an apartment master leaves historical records frozen until explicit draft rebase",()=>{
 const x=browser(),p=x.portfolio();
 const before=JSON.stringify(p.objects[0].settlements["2024"]);
 const prior=JSON.stringify(p.objects[0].settlements["2025"]);
 x.act("edit-master-unit","DEMO-W01");
 assert.match(x.drawer(),/Wohnfläche/);
 x.save({label:"Wohnung A – neu",position:"EG links",area:"72"});
 let changed=x.portfolio();
 assert.equal(changed.objects[0].units[0].area,72);
 assert.equal(JSON.stringify(changed.objects[0].settlements["2024"]),before);
 assert.equal(JSON.stringify(changed.objects[0].settlements["2025"]),prior);
 x.act("open-year","SYN-A|2025");
 assert.match(x.html(),/Stammdaten wurden geändert/);
 x.act("rebase-year");
 changed=x.portfolio();
 assert.equal(changed.objects[0].settlements["2025"].units[0].area,72);
 assert.equal(changed.objects[0].settlements["2025"].reviewInvalidated,true);
 assert.equal(JSON.stringify(changed.objects[0].settlements["2024"]),before);
});
test("monthly/annual agreed and actual paid are distinct and editable only within open year",()=>{
 const x=browser(),id=x.state().tenancies[0].id;
 x.act("open-year","SYN-A|2025");
 x.act("edit-payment",id);
 assert.match(x.drawer(),/Tatsächlich gezahlt/);
 x.save({mode:"monthly",agreed:"195",paid:"1660"});
 const s=x.state();
 assert.equal(s.payments[id].agreedMonthly,195);
 assert.equal(s.payments[id].paidActual,1660);
 assert.equal(s.tenancies[0].advance,2000);
});
test("all bill workflow steps stay ordered and single source of truth",()=>{
 const x=browser();x.act("open-year","SYN-A|2025");
 const html=x.html();
 assert.ok(html.indexOf('data-step="advance"')<html.indexOf('data-step="costs"'));
 assert.ok(html.indexOf('data-step="review"')<html.indexOf('data-step="allocation"'));
 x.click("[data-step]",{step:"water"});
 x.click("[data-consumption-tab]",{consumptionTab:"techem"});
 assert.match(x.html(),/Kosten laut Techem/);
 x.act("edit-cost","waste");
 assert.match(x.drawer(),/Zuordnung und Ausnahmen/);
 assert.doesNotMatch(x.drawer(),/data-case-consumption/);
 x.act("edit-case-water",x.state().tenancies[0].id);
 assert.match(x.drawer(),/Kaltwasser-Verbrauch/);
});
test("water form computes but never exposes arbitrary manual vacancy",()=>{
 const x=browser(),u=x.state().units[0];
 x.act("edit-water",u.id);
 assert.doesNotMatch(x.drawer(),/name="vacancyCold"/);
 assert.match(x.drawer(),/KW-Zwischenablesung/);
 assert.match(x.drawer(),/water-live-sum/);
 x.act("replace-meter",u.id+"|cold");
 assert.match(x.drawer(),/Ausbau-Endstand/);
});
test("portfolio selection persists across app reload without touching legacy key",()=>{
 const store=new Map(),x=browser(store);
 x.act("open-year","SYN-C|2024");
 const y=browser(store);
 assert.equal(y.portfolio().selectedObjectId,"SYN-C");
 assert.equal(y.state().period,"2024");
 assert.equal(store.has("nkpro2_design_demo_20261121_v1"),false);
 assert.equal(y.window.NKPRO2_DEMO_TEST.storageKey,"nkpro2_synthetic_portfolio_0_7_v1");
});
test("quality remains incomplete, no completed bill or final letters",()=>{
 const x=browser();x.act("open-year","SYN-A|2025");
 x.click("[data-step]",{step:"review"});
 assert.match(x.html(),/44/);
 assert.match(x.html(),/Abschluss gesperrt/);
 const r=x.window.NKPRO2_REVIEW.assess(x.state(),x.window.NKPRO2_CASE_BILLING.calculate(x.state()));
 assert.equal(r.readyForClose,false);
});

test("0.8 navigation has one route per task, grouped property branches and clear global context",()=>{
 const x=browser(),shell=fs.readFileSync(path.join(root,"index.html"),"utf8");
 const views=[...shell.matchAll(/class="nav-item(?: active)?" data-view="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(views,["overview","analytics","documents"]);
 assert.match(x.html(),/Startseite/);
 assert.doesNotMatch(x.tree(),/tree-section-children/);
 x.act("select-property","SYN-B");
 assert.match(x.tree(),/Stammdaten/);
 assert.match(x.tree(),/Jahresabrechnungen/);
 assert.match(x.tree(),/2024/);
 assert.doesNotMatch(x.tree(),/Objektdaten/);
 x.act("toggle-tree-section","master");
 assert.match(x.tree(),/Objektdaten/);
 assert.match(x.tree(),/Wohnungen/);
 x.act("open-object-tab","units");
 assert.match(x.html(),/Wohnungen/);
 assert.match(x.tree(),/tree-subitem selected/);
 x.act("object-billings","SYN-B");
 assert.match(x.html(),/Jahresabrechnungen/);
 x.act("open-year","SYN-B|2024");
 assert.match(x.tree(),/tree-year selected/);
 x.click("[data-view]",{view:"analytics"});
 assert.match(x.html(),/Analysezentrum/);
 assert.match(x.node("breadcrumbView").textContent,/Objektübergreifend/);
 assert.doesNotMatch(x.tree(),/tree-property expanded/);
 x.click("[data-view]",{view:"documents"});
 assert.match(x.node("breadcrumbView").textContent,/Dokumente & Archiv/);
 x.click("[data-view]",{view:"overview"});
 assert.match(x.html(),/Startseite/);
 assert.equal(x.portfolio().selectedObjectId,"SYN-B");
});

test("0.9 homepage shows estate cards and object-scoped years without property filter",()=>{
 const x=browser();
 assert.match(x.html(),/estate-grid/);
 assert.match(x.html(),/Neues Objekt/);
 x.act("object-billings","SYN-A");
 assert.match(x.html(),/Jahresabrechnungen/);
 assert.doesNotMatch(x.html(),/class="portfolio-filter"/);
 assert.doesNotMatch(x.html(),/Musterobjekt B/);
 assert.match(x.html(),/Abrechnung 2025/);
 assert.match(x.tree(),/tree-icon/);
 assert.match(x.tree(),/svg/);
 assert.doesNotMatch(x.tree(),/[⌄›]/);
});
test("0.9 adding, archiving and restoring objects preserves annual history",()=>{
 const x=browser();
 x.act("new-object");
 assert.match(x.drawer(),/Objektbezeichnung/);
 x.save({name:"Musterobjekt D",street:"Demostraße 4",postalCode:"00004",city:"Musterstadt"});
 let p=x.portfolio(),added=p.objects.find(o=>o.name==="Musterobjekt D");
 assert.ok(added);
 assert.equal(added.units.length,0);
 assert.equal(added.settlements["2025"],undefined);
 assert.match(x.html(),/Musterobjekt D/);
 assert.match(x.tree(),/Musterobjekt D/);
 x.act("new-master-unit");
 assert.match(x.drawer(),/Wohnfläche/);
 x.save({label:"Wohnung 1",position:"EG links",area:"60"});
 p=x.portfolio();added=p.objects.find(o=>o.name==="Musterobjekt D");
 assert.equal(added.units.length,1);
 assert.match(added.units[0].id,/^SYN-W-/);
 assert.ok(added.sync.version>1);
 x.act("new-year");
 x.save({year:"2025"});
 assert.match(x.toast(),/Vor dem Jahresentwurf/);
 const snap=JSON.stringify(p.objects[0].settlements["2024"]);
 x.act("archive-object","SYN-A");
 p=x.portfolio();
 assert.equal(p.objects[0].lifecycle.status,"archived");
 assert.equal(JSON.stringify(p.objects[0].settlements["2024"]),snap);
 assert.doesNotMatch(x.tree(),/Musterobjekt A/);
 assert.match(x.html(),/Archivierte Immobilien/);
 x.act("restore-object","SYN-A");
 p=x.portfolio();
 assert.equal(p.objects[0].lifecycle.status,"active");
 assert.match(x.tree(),/Musterobjekt A/);
});
