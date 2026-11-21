"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const crypto=require("node:crypto");
const kernel=require("../experimental/quality-contract.js");
const catalog=require("../contracts/legacy-quality-registry.json");
function sourceBlob(content){
 return crypto.createHash("sha1").update("blob "+Buffer.byteLength(content)+"\0").update(content).digest("hex");
}
function synthetic(){
 return{fixtureKind:"synthetic",
   period:{year:"2025",start:"2025-01-01",end:"2025-12-31"},
   units:[{id:"U1",status:"aktiv"},{id:"U2",status:"aktiv"}],
   tenants:[
     {id:"T1",name:"Muster Mieter 1",unitId:"U1",start:"2025-01-01",end:"2025-06-30",private:false},
     {id:"T2",name:"Muster Mieter 2",unitId:"U1",start:"2025-07-01",end:"2025-12-31",private:false},
     {id:"T0",name:"Muster Privat",unitId:"U2",start:"2010-01-01",private:true}
   ]
 };
}
const pinned=fs.readFileSync(path.join(__dirname,"reference","quality-rules-v99.4.86.js"),"utf8");
test("registry mirrors original V99.4.86 rule metadata, including route/decision restrictions",()=>{
 assert.equal(sourceBlob(pinned),catalog.source.blobSha);
 const ctx=vm.createContext({});
 vm.runInContext(pinned,ctx,{timeout:3000});
 const source=JSON.parse(JSON.stringify(ctx.NKProQualityRules.REGISTRY));
 assert.equal(source.length,44);
 const fields=["id","title","category","group","severity","blocking","confirmAllowed",
   "allowNotApplicable","justification","targetTab","targetSelector","dataSource","solution","version"];
 for(let i=0;i<source.length;i++){
   for(const field of fields)assert.deepEqual(catalog.rules[i][field],source[i][field],
     "metadata mismatch "+source[i].id+" "+field);
 }
});
test("synthetic seven checks execute, remaining 37 are NEVER represented as passed",()=>{
 const r=kernel.evaluateEarly(synthetic());
 assert.equal(r.counts.total,44);
 assert.equal(r.counts.experimental,7);
 assert.equal(r.counts.passed,7);
 assert.equal(r.counts.notRun,37);
 assert.equal(r.readyForRealFinalization,false);
 assert.equal(r.complete,false);
});
test("private user remains an ordinary settlement participant",()=>{
 const f=synthetic();f.tenants=f.tenants.filter(x=>x.private);
 const r=kernel.evaluateEarly(f);
 assert.equal(r.rows.find(x=>x.ruleId==="NKP-FACH-003").status,"passed");
});
test("leap day must be validated rather than normalized silently",()=>{
 const f=synthetic();
 f.period.start="2025-02-29";
 assert.equal(kernel.evaluateEarly(f).rows[0].status,"critical");
 f.period.start="2024-02-29";
 f.period.end="2024-12-31";
 f.period.year="2024";
 assert.equal(kernel.evaluateEarly(f).rows[0].status,"passed");
});
test("same-day occupancy overlap is critical, adjacent day is valid",()=>{
 const f=synthetic();
 f.tenants[1].start="2025-06-30";
 let r=kernel.evaluateEarly(f);
 assert.equal(r.rows.find(x=>x.ruleId==="NKP-FACH-007").status,"critical");
 f.tenants[1].start="2025-07-01";
 r=kernel.evaluateEarly(f);
 assert.equal(r.rows.find(x=>x.ruleId==="NKP-FACH-007").status,"passed");
});
test("missing tenant name and non-existent apartment remain blocking",()=>{
 const f=synthetic();f.tenants[2].name="";f.tenants[2].unitId="MISSING";
 const r=kernel.evaluateEarly(f);
 assert.equal(r.rows.find(x=>x.ruleId==="NKP-FACH-004").status,"critical");
 assert.equal(r.rows.find(x=>x.ruleId==="NKP-FACH-005").status,"critical");
});
test("missing active units and reversed rental dates block the subset",()=>{
 const f=synthetic();
 f.units.forEach(x=>x.status="inaktiv");
 f.tenants[0].end="2024-12-30";
 const r=kernel.evaluateEarly(f);
 assert.equal(r.rows.find(x=>x.ruleId==="NKP-FACH-002").status,"critical");
 assert.equal(r.rows.find(x=>x.ruleId==="NKP-FACH-006").status,"critical");
});
test("production-shaped input rejected before any evaluation",()=>{
 const f=synthetic();delete f.fixtureKind;
 assert.throws(()=>kernel.evaluateEarly(f),/Synthetic-only/);
});
test("review does not change the synthetic working state",()=>{
 const f=synthetic(),before=JSON.stringify(f);
 kernel.evaluateEarly(f);
 assert.equal(JSON.stringify(f),before);
});
