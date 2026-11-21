"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const crypto=require("node:crypto");
const preflight=require("../experimental/letter-preflight.js");
const pinned=fs.readFileSync(path.join(__dirname,"reference","document-data-v99.4.86.js"),"utf8");
const actual=crypto.createHash("sha1").update("blob "+Buffer.byteLength(pinned)+"\0").update(pinned).digest("hex");
const EXPECTED="3df7d1b05696860e658be1e5ede6c163ed26bbab";
const sandbox=vm.createContext({num:x=>Number(x)||0});
vm.runInContext(pinned,sandbox,{timeout:3000});
const legacy=sandbox.NKProDocumentData;
function fixture(privateUse=false){
 return {
  fixtureKind:"synthetic",period:{start:"2025-01-01",end:"2025-12-31"},
  tenant:{id:privateUse?"TEST-M0":"TEST-M1",name:"Testmieter",street:"Musterweg 1",
    postalCode:"60000",city:"Beispielstadt",private:privateUse},
  settings:{senderName:"Mustereigentümer",letterDate:"2026-11-22",
    signature:"Mustermann",bankAccount:"TEST-IBAN"},
  rows:[{costId:"K009",name:"Müll",shareCents:50100,prepaymentCents:30000},
    {costId:"K006",name:"Heizkosten",shareCents:20800,prepaymentCents:12000}],
  settlement:{costShareCents:70900,prepaymentsCents:42000,correctionCents:1000}
 };
}
test("pinned original letter result calculation source remains untouched",()=>{
 assert.equal(actual,EXPECTED);
 assert.equal(typeof legacy.settlementInfoForResult,"function");
});
for(const [cost,pre,cor] of [[709,420,10],[100,105,0],[100,100,0],[1.01,0.52,-1.25]]){
 test("synthetic letter saldo matches legacy settlement result "+cost+"/"+pre,()=>{
  const f=fixture();f.rows=[{costId:"ONE",name:"Synthetic",shareCents:Math.round(cost*100),prepaymentCents:Math.round(pre*100)}];
  f.settlement={costShareCents:Math.round(cost*100),prepaymentsCents:Math.round(pre*100),correctionCents:Math.round(cor*100)};
  const result=preflight.prepare(f);
  const legacyResult=legacy.settlementInfoForResult({costShare:cost,prepayments:pre,correction:cor},{vorjahresKorrektur:0});
  assert.equal(result.saldo.type,legacyResult.type);
  assert.ok(Math.abs(result.saldo.amountCents/100-legacyResult.amount)<1e-8);
  assert.equal(result.readyForPrint,false);
 });
}
test("private use is treated as ordinary letter recipient",()=>{
 const result=preflight.prepare(fixture(true));
 assert.equal(result.errors.length,0);
 assert.equal(result.dataReady,true);
 assert.equal(result.readyForPrint,false);
});
test("cent-level cost and prepayment mismatch blocks the data preflight",()=>{
 const f=fixture();f.rows[0].shareCents--;
 f.rows[1].prepaymentCents++;
 const r=preflight.prepare(f);
 assert.ok(r.errors.some(x=>x.code==="LETTER_COST_MISMATCH"));
 assert.ok(r.errors.some(x=>x.code==="LETTER_PREPAYMENT_MISMATCH"));
 assert.equal(r.dataReady,false);
});
test("missing recipient street, sender and invalid date are errors",()=>{
 const f=fixture();f.tenant.street="";f.settings.senderName="";f.settings.letterDate="2025-02-29";
 const r=preflight.prepare(f);
 assert.ok(r.errors.some(x=>x.code==="MISSING_RECIPIENT_FIELD"));
 assert.ok(r.errors.some(x=>x.code==="MISSING_LETTER_SETTING"));
 assert.ok(r.errors.some(x=>x.code==="INVALID_LETTER_DATE"));
});
test("review signature is stale after a value or an address change",()=>{
 const f=fixture(),a=preflight.prepare(f);
 assert.equal(preflight.prepare(f,{reviewedSignature:a.signature}).dataReviewed,true);
 f.rows[0].shareCents+=100;f.settlement.costShareCents+=100;
 assert.equal(preflight.prepare(f,{reviewedSignature:a.signature}).dataReviewed,false);
 f.rows[0].shareCents-=100;f.settlement.costShareCents-=100;
 f.tenant.street="Different test avenue";
 assert.equal(preflight.prepare(f,{reviewedSignature:a.signature}).dataReviewed,false);
});
test("missing expected recipient blocks bundle even if produced letters are complete",()=>{
 const one=fixture();
 const r=preflight.prepareAll({fixtureKind:"synthetic",letters:[one],expectedTenantIds:["TEST-M1","TEST-M0"]});
 assert.equal(r.dataReady,false);
 assert.deepEqual(r.missingRecipients,["TEST-M0"]);
 assert.equal(r.readyForPrint,false);
});
test("bundle with all synthetic recipients can be data-ready, but never print-ready",()=>{
 const result=preflight.prepareAll({fixtureKind:"synthetic",letters:[fixture(),fixture(true)],
  expectedTenantIds:["TEST-M1","TEST-M0"]});
 assert.equal(result.dataReady,true);
 assert.equal(result.readyForPrint,false);
 assert.equal(result.readyForRealFinalization,false);
});
test("input is never mutated; untaged real data is rejected",()=>{
 const f=fixture(),copy=JSON.stringify(f);
 preflight.prepare(f);
 assert.equal(JSON.stringify(f),copy);
 delete f.fixtureKind;
 assert.throws(()=>preflight.prepare(f),/Synthetic-only/);
});
