"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
  fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const wf=require("../synthetic-workflow.js");
function browser(){
 const handlers={},elements=new Map(),store=new Map();
 const navs=["overview","billing","object","analytics","documents"].map(view=>({
  dataset:{view},classList:{toggle(){},remove(){},add(){}},setAttribute(){},removeAttribute(){}}));
 function node(id){if(!elements.has(id))elements.set(id,{id,innerHTML:"",textContent:"",hidden:id==="drawer",
  style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},isConnected:true,
  addEventListener(evt,fn){handlers[id+":"+evt]=fn},focus(){},
  querySelectorAll(){return []},querySelector(){return null}});return elements.get(id)}
 const doc={body:{style:{},classList:{remove(){},add(){},toggle(){}}},
   getElementById:node,querySelectorAll(sel){return sel===".nav-item"?navs:[]},
   addEventListener(evt,fn){handlers[evt]=fn},activeElement:null};
 const win={document:doc,console,setTimeout(){return 0},clearTimeout(){},
  localStorage:{getItem(k){return store.get(k)||null},setItem(k,v){store.set(k,v)}},
  scrollTo(){},confirm(){return true},print(){},Date,Intl,Math,JSON,Number,Set,Map,Error,
  Object,Array,String,Boolean,parseInt,parseFloat};
 win.window=win;win.globalThis=win;
 const ctx=vm.createContext(win,{name:"nkpro2-stage-012"});
 const names=["demo-ledger.js","experimental/settlement-cost.js","water-detail.js",
   "synthetic-billing.js","synthetic-property.js","synthetic-workflow.js",
   "synthetic-case-billing.js","synthetic-letters.js","legacy-letter-engine.js","letter-workspace-ui.js","synthetic-review.js",
   "synthetic-estate.js","synthetic-master-ui.js","app.js"];
 for(const file of names)vm.runInContext(fs.readFileSync(path.join(root,file),"utf8"),
   ctx,{filename:file,timeout:5000});
 function click(sel,data){handlers.click({target:{closest(k){return k===sel?{dataset:data}:null}}})}
 function act(action,id=""){click("[data-action]",{action,id})}
 function save(values){
   const elements=Object.fromEntries(Object.entries(values).map(([key,val])=>
     [key,{value:String(val),checked:Boolean(val)}]));
   handlers.submit({target:{id:"editForm",elements,querySelectorAll(){return []}},preventDefault(){}});
 }
 return{window:win,act,click,save,html:()=>node("appMain").innerHTML,
   drawer:()=>node("drawerBody").innerHTML,footer:()=>node("drawerFooter").innerHTML,
   tree:()=>node("portfolioTree").innerHTML,toast:()=>node("toast").textContent,
   portfolio:()=>win.NKPRO2_DEMO_TEST.getPortfolio()};
}
test("0.12 clicking Jahresabrechnungen opens a real local overview; no redundant Alle Jahre",()=>{
 const x=browser();
 x.act("select-property","SYN-A");
 assert.match(x.tree(),/Jahresabrechnungen/);
 assert.doesNotMatch(x.tree(),/>Alle Jahre</);
 x.act("object-billings","SYN-A");
 assert.match(x.html(),/Jahresübersicht/);
 assert.equal((x.html().match(/class="annual-row"/g)||[]).length,3);
 assert.match(x.html(),/data-action="open-year"/);
 assert.match(x.html(),/class="button edit-action"/);
 assert.match(x.html(),/class="button edit-action view-action"/);
 x.act("open-year","SYN-A|2025");
 assert.match(x.html(),/Abrechnung 2025/);
});
test("0.12 expected monthly and yearly agreements handle partial months, leap years and actual cash separately",()=>{
 const part={start:"2024-02-14",end:"2024-03-15"};
 const m=wf.agreementPreview(part,{mode:"monthly",agreedMonthly:200});
 assert.equal(m.valid,true);
 assert.equal(m.monthly,200);
 assert.equal(m.annual,2400);
 assert.ok(m.weekly>0&&m.weekly<50);
 assert.equal(m.expected,wf.expectedMonthly(part.start,part.end,200));
 const a=wf.agreementPreview(part,{mode:"annual",agreedAnnual:2400,annualBasis:"fullYear"});
 assert.equal(a.expected,Math.round(2400*31/366*100)/100);
 assert.equal(wf.agreementPreview(part,{mode:"annual",agreedAnnual:null}).valid,false);
 assert.equal(wf.agreementPreview(part,{mode:"annual",agreedAnnual:2400}).expected,2400);
 assert.equal(wf.actualPreview({paidMode:"monthly",paidMonthly:195,paidMonths:7}).actual,1365);
 assert.equal(wf.actualPreview({paidMode:"monthly",paidMonthly:"",paidMonths:""}).valid,false);
});
test("0.12 annual-monthly payment entry converts only recorded incoming payments",()=>{
 const x=browser();x.act("open-year","SYN-A|2025");
 const id=x.portfolio().objects[0].settlements["2025"].tenancies[0].id;
 x.act("edit-payment",id);
 assert.match(x.drawer(),/Soll im Mietzeitraum/);
 assert.match(x.drawer(),/Pro Woche/);
 assert.match(x.drawer(),/tatsächlich gebuchter Monatszahlungen/);
 x.save({mode:"monthly",agreed:240,paidMode:"monthly",paidMonthly:100,
   paidMonths:8,paid:0});
 const p=x.portfolio().objects[0].settlements["2025"].payments[id];
 assert.equal(p.paidActual,800);
 assert.equal(p.agreedMonthly,240);
 assert.equal(p.agreedAnnual,null);
 assert.equal(wf.expected({start:"2025-01-01",end:"2025-12-31"},p),2880);
 assert.match(x.html(),/800,00/);
});
test("0.12 cost editing has original K codes, invoice quantity and included-by-default cases",()=>{
 const x=browser();x.act("open-year","SYN-A|2025");
 x.click("[data-step]",{step:"costs"});
 assert.match(x.html(),/cost-master-table/);
 assert.match(x.html(),/K002/);
 assert.match(x.html(),/K009/);
 assert.match(x.html(),/K006/);
 assert.doesNotMatch(x.html(),/data-action="toggle-cost"/);
 assert.doesNotMatch(x.html(),/data-action="delete-unused-cost"/);
 x.act("edit-cost","water");
 assert.match(x.drawer(),/Verbrauch laut Rechnung/);
 assert.match(x.drawer(),/costPricePreview/);
 assert.match(x.drawer(),/data-case-include/);
 assert.doesNotMatch(x.drawer(),/data-case-exclude/);
 assert.match(x.drawer(),/Kostenart deaktivieren/);
 x.save({name:"Wasser & Abwasser",sourceId:"K002",amount:1850,landlordShare:0,
   method:"Verbrauch",priceMode:"auto",unitPrice:"",invoiceConsumption:275,
   exclusionMode:"full",invoiceDate:"2025-12-30",documentDate:"2025-12-31",
   invoiceNumber:"MUSTER",issuer:"Beispiel",invoiceReference:"",note:"Test"});
 const a=x.portfolio().objects[0].settlements["2025"];
 const c=a.costs.find(v=>v.id==="water");
 assert.equal(c.sourceId,"K002");
 assert.equal(c.consumptionTotal,275);
 assert.equal(a.houseWater,275);
 assert.deepEqual(c.excludedTenantIds,[]);
});
test("0.12 cost lifecycle requires exact edit drawer, independent confirmation and preserves history",()=>{
 const x=browser();x.act("open-year","SYN-A|2025");
 x.click("[data-step]",{step:"costs"});
 x.act("toggle-cost","waste");assert.match(x.toast(),/nur über Bearbeiten/);
 assert.equal(x.portfolio().objects[0].settlements["2025"].costs.find(c=>c.id==="waste").active,true);
 x.act("edit-cost","waste");assert.match(x.drawer(),/Kostenart deaktivieren/);
 x.window.confirm=()=>false;
 x.act("toggle-cost","waste");
 assert.equal(x.portfolio().objects[0].settlements["2025"].costs.find(c=>c.id==="waste").active,true);
 x.window.confirm=()=>true;
 x.act("toggle-cost","waste");
 assert.equal(x.portfolio().objects[0].settlements["2025"].costs.find(c=>c.id==="waste").active,false);
 x.act("open-year","SYN-A|2024");
 x.click("[data-step]",{step:"costs"});
 assert.match(x.html(),/data-action="view-cost"/);
 assert.doesNotMatch(x.html(),/data-action="edit-cost"/);
});
test("0.12 water bands, total emphasis and status before editor; results are by-cost read only",()=>{
 const x=browser();x.act("open-year","SYN-A|2025");
 x.click("[data-step]",{step:"water"});
 assert.match(x.html(),/class="money water-cold"/);
 assert.match(x.html(),/class="money water-hot"/);
 assert.match(x.html(),/water-total-value/);
 assert.match(x.html(),/class="action-cell"/);
 assert.match(x.html(),/class="status-column"/);
 assert.match(x.html(),/data-action="edit-water"/);
 x.click("[data-step]",{step:"allocation"});
 assert.match(x.html(),/result-detail-table/);
 assert.match(x.html(),/K002/);
 assert.match(x.html(),/Tatsächlich gezahlt/);
 assert.doesNotMatch(x.html(),/data-action="show-unit-result"|data-action="go-letter"|Zur Briefvorschau/);
});
