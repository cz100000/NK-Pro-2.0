"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
function browser(){
  const handlers={},elements=new Map(),store=new Map(),navs=["overview","billing","object","analytics","documents"].map(view=>({
    dataset:{view},classList:{toggle(){},remove(){},add(){}},setAttribute(){},removeAttribute(){}
  }));
  function node(id){if(!elements.has(id))elements.set(id,{id,innerHTML:"",textContent:"",hidden:id==="drawer",
    value:"",style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},isConnected:true,
    addEventListener(evt,fn){handlers[id+":"+evt]=fn},focus(){},
    querySelectorAll(){return []},querySelector(){return null}
  });return elements.get(id)}
  const document={
    body:{style:{},classList:{remove(){},add(){},toggle(){}}},
    getElementById:node,
    querySelectorAll(sel){return sel===".nav-item"?navs:[]},
    addEventListener(name,fn){handlers[name]=fn},
    activeElement:null
  };
  const win={document,console,setTimeout(){return 0},clearTimeout(){},
    localStorage:{getItem(k){return store.get(k)||null},setItem(k,v){store.set(k,v)}},
    scrollTo(){},confirm(){return true},print(){},Date,Intl,Math,JSON,Number,Set,Map,Error,
    Object,Array,String,Boolean,parseInt,parseFloat};
  win.window=win;win.globalThis=win;
  const ctx=vm.createContext(win,{name:"nkpro2-synthetic-browser"});
  const sources=["demo-ledger.js","experimental/settlement-cost.js","water-detail.js",
    "synthetic-billing.js","synthetic-property.js","synthetic-workflow.js",
    "synthetic-case-billing.js","synthetic-letters.js","synthetic-review.js",
    "synthetic-estate.js","synthetic-master-ui.js","app.js"];
  for(const filename of sources){
    const src=fs.readFileSync(path.join(root,filename),"utf8");
    vm.runInContext(src,ctx,{filename,timeout:5000});
  }
  function click(selector,data){
    assert.ok(handlers.click,"No click handler");
    handlers.click({target:{closest(key){return key===selector?{dataset:data}:null}}});
  }
  function save(data){
    const fieldEntries=Object.entries(data).map(([k,v])=>[k,{value:String(v),checked:!!v}]);
    const form={id:"editForm",elements:Object.fromEntries(fieldEntries),
      querySelectorAll(){return []}};
    handlers.submit({target:form,preventDefault(){}});
  }
  return {window:win,document,node,click,save,getState:()=>win.NKPRO2_DEMO_TEST.getState(),
    source:()=>node("appMain").innerHTML,
    drawer:()=>node("drawerBody").innerHTML};
}
test("synthetic 0.6 UI initializes without runtime errors and uses seven tenancy cases",()=>{
 const app=browser(),state=app.getState();
 assert.equal(state.tenancies.length,7);
 assert.equal(state.units.length,7);
 assert.match(app.source(),/Übersicht/);
 app.click("[data-view]",{view:"billing"});
 assert.match(app.source(),/Gesamtkosten/);
 app.click("[data-step]",{step:"tenancies"});
 assert.match(app.source(),/Mietverhältnisse und Abrechnungsfälle/);
 assert.match(app.source(),/Musterperson A/);
 app.click("[data-view]",{view:"object"});
 assert.match(app.source(),/Mietverhältnisse/);
 app.click("[data-object-tab]",{objectTab:"meters"});
 assert.match(app.source(),/Zählerbestand/);
 app.click("[data-object-tab]",{objectTab:"units"});
 assert.match(app.source(),/Wohnungen/);
});
test("synthetic case editor saves start/end, and new cases cannot be silently merged",()=>{
 const app=browser(),first=app.getState().tenancies[0];
 app.click("[data-action]",{action:"edit-tenancy",id:first.id});
 assert.doesNotMatch(app.drawer(),/Verbrauch bei Mieterwechsel/);
 app.save({firstName:first.firstName,lastName:first.lastName,salutation:"neutral",customSalutation:"",recipientStreet:"",recipientPostalCode:"",recipientCity:"",unitId:first.unitId,role:"Mieter",
   start:"2025-01-01",end:"2025-06-30",persons:1,advance:1000,
   consumptionCold:"",consumptionHot:"",tenantNote:"Demo"});
 let state=app.getState();
 assert.equal(state.tenancies[0].end,"2025-06-30");
 app.click("[data-action]",{action:"new-tenancy",id:""});
 app.save({firstName:"Zweite",lastName:"Musterperson",salutation:"neutral",customSalutation:"",recipientStreet:"",recipientPostalCode:"",recipientCity:"",unitId:first.unitId,role:"Privatanteil",
   start:"2025-07-01",end:"2025-12-31",persons:2,advance:800,
   consumptionCold:"",consumptionHot:"",tenantNote:"Test"});
 state=app.getState();
 assert.equal(state.tenancies.length,8);
 assert.equal(state.tenancies.at(-1).role,"Privatanteil");
 assert.ok(app.window.NKPRO2_DEMO_TEST.ledger().issues.some(i=>i.code==="CASE_WATER_SPLIT_MISSING"));
});
test("cost editor includes all-case eligibility and independent consumption inputs",()=>{
 const app=browser();app.click("[data-action]",{action:"edit-cost",id:"waste"});
 assert.match(app.drawer(),/Zuordnung und Ausnahmen/);
 assert.match(app.drawer(),/Einzelverbräuche.*Verbräuche/);
 assert.match(app.drawer(),/Notiz \/ Bemerkung/);
});
test("standalone water editor contains dated physical replacement action",()=>{
 const app=browser(),id=app.getState().units[0].id;
 app.click("[data-action]",{action:"edit-water",id});
 assert.match(app.drawer(),/Zählerwechsel dokumentieren/);
 app.click("[data-action]",{action:"replace-meter",id:id+"|cold"});
 assert.match(app.drawer(),/Ausbau-Endstand/);
});

test("reordered process has advances before invoices and review before result",()=>{
 const app=browser();app.click("[data-view]",{view:"billing"});
 const html=app.source();
 assert.ok(html.indexOf("Vorauszahlungen")<html.indexOf("Gesamtkosten"));
 assert.ok(html.indexOf(">Prüfen<")<html.indexOf(">Ergebnis<"));
});
test("partial quality module never permits finalization, even with synthetic valid inputs",()=>{
 const app=browser(),review=app.window.NKPRO2_REVIEW.assess(app.getState(),app.window.NKPRO2_CASE_BILLING.calculate(app.getState()));
 assert.equal(review.counts.total,44);
 assert.equal(review.counts.notRun,19);
 assert.equal(review.readyForClose,false);
 app.click("[data-view]",{view:"billing"});app.click("[data-step]",{step:"review"});
 assert.match(app.source(),/Abschluss gesperrt/);
});
test("Techem costs live in consumption workspace not general invoices",()=>{
 const app=browser();app.click("[data-view]",{view:"billing"});
 app.click("[data-step]",{step:"water"});app.click("[data-consumption-tab]",{consumptionTab:"techem"});
 assert.match(app.source(),/Heizung/);
 assert.match(app.source(),/Kosten laut Techem/);
});

test("single source of truth: case water editable only in Verbräuche",()=>{
 const app=browser(),t=app.getState().tenancies[0];
 app.click("[data-action]",{action:"edit-tenancy",id:t.id});
 assert.doesNotMatch(app.drawer(),/name="consumptionCold"/);
 app.click("[data-action]",{action:"edit-case-water",id:t.id});
 assert.match(app.drawer(),/Kaltwasser-Verbrauch/);
 app.save({caseCold:5,caseHot:8});
 assert.equal(app.getState().tenancies[0].consumptionCold,5);
 assert.equal(app.getState().tenancies[0].consumptionHot,8);
});
test("water form no longer offers manual vacancy consumption",()=>{
 const app=browser(),u=app.getState().units[0];
 app.click("[data-action]",{action:"edit-water",id:u.id});
 assert.doesNotMatch(app.drawer(),/name="vacancyCold"/);
 assert.match(app.drawer(),/KW-Zwischenablesung/);
 assert.match(app.drawer(),/water-live-sum/);
});
