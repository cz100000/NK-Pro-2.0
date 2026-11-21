"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const crypto=require("node:crypto");
const inspector=require("../experimental/legacy-backup-inspector.js");
const pinned=fs.readFileSync(path.join(__dirname,"reference","backup-recovery-v99.4.86.js"),"utf8");
const SHA="d242097e7a1fc5c247ffa2282343bbc44f297f31";
test("pinned original backup-recovery code is byte-for-byte frozen",()=>{
 const got=crypto.createHash("sha1").update("blob "+Buffer.byteLength(pinned)+"\0").update(pinned).digest("hex");
 assert.equal(got,SHA);
});
const context=vm.createContext({});
vm.runInContext(pinned,context,{filename:"backup-recovery-v99.4.86.js",timeout:3000});
const original=context.NKProBackupRecovery;
const fixture=()=>({
 meta:{dataSchemaVersion:5,abrechnungsjahr:"2025"},
 wohnungen:[{id:"D-1"},{id:"D-2"}],
 mieter:[{id:"DEMO-M1",name:"CONFIDENTIAL SENTINEL (never display)"}],
 kostenarten:[{id:"K001",gesamtbetrag:100}],
 jahresArchiv:[{year:2024}]
});
function envelope(){
 return original.createBackupEnvelope(fixture(),{
  backupId:"synthetic-test-1",sourceSchemaVersion:5,targetSchemaVersion:5,
  dataLayerContractVersion:1,now:()=>"2026-11-21T18:00:00.000Z"
 });
}
test("original legacy envelope and read-only inspector agree on valid input",()=>{
 const e=envelope(),ref=original.validateBackupEnvelope(e),result=inspector.inspect(e);
 assert.equal(ref.valid,true);assert.equal(result.ok,true);assert.equal(result.integrity,"verified");
 assert.equal(result.sourceSchemaVersion,5);assert.deepEqual(result.counts,{units:2,tenancies:1,costs:1,archives:1});
 assert.equal(JSON.stringify(result).includes("CONFIDENTIAL SENTINEL"),false);
});
test("tampered invoice invalidates payload and total checksum",()=>{
 const e=JSON.parse(JSON.stringify(envelope()));
 e.data.kostenarten[0].gesamtbetrag=1000;
 assert.equal(original.validateBackupEnvelope(e).valid,false);
 const r=inspector.inspect(e);
 assert.equal(r.ok,false);assert.ok(r.errors.includes("PAYLOAD_CHECKSUM"));assert.ok(r.errors.includes("ENVELOPE_CHECKSUM"));
});
test("tampered metadata invalidates metadata and envelope checksums",()=>{
 const e=JSON.parse(JSON.stringify(envelope()));
 e.metadata.backupType="modified";
 const r=inspector.inspect(e);
 assert.equal(r.ok,false);assert.ok(r.errors.includes("METADATA_CHECKSUM"));assert.ok(r.errors.includes("ENVELOPE_CHECKSUM"));
});
test("raw JSON is identified honestly as NOT integrity-verified",()=>{
 const r=inspector.inspect(fixture());
 assert.equal(r.ok,true);assert.equal(r.kind,"legacy-raw-export");
 assert.equal(r.integrity,"not-provided");assert.ok(r.warning);
});
test("invalid and unrecognized data cannot enter the migration path",()=>{
 assert.equal(inspector.inspect({}).ok,false);
 assert.equal(inspector.inspect({format:"wrong",data:{}}).ok,false);
 assert.equal(inspector.inspect({format:"nk-pro-backup-envelope",formatVersion:2,metadata:{},data:{}}).ok,false);
});
test("analysis leaves original data untouched",()=>{
 const e=JSON.parse(JSON.stringify(envelope())),before=JSON.stringify(e);
 inspector.inspect(e);
 assert.equal(JSON.stringify(e),before);
});
