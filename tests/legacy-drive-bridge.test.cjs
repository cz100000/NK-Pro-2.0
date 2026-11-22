"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
if(!globalThis.crypto)globalThis.crypto=require("node:crypto").webcrypto;
const schema5=require("../private/private-model.js");
globalThis.NKPRO2_PRIVATE_MODEL=schema5;
const model=require("../integrated-data.js"),cipher=require("../private/vault-crypto.js"),
 adapter=require("../private/drive-adapter.js"),{source}=require("./integrated-real-master.test.cjs");
const pass="Synthetic Long Passphrase 2026";
function mock(original=source()){
 const old={id:"1-old",name:"NK-Pro – Privatdaten",mimeType:"application/vnd.google-apps.folder"},
  next={id:"1-new",name:"NK-Pro 2.0 – Privatdaten",mimeType:"application/vnd.google-apps.folder"};
 const metadata={id:"old-source",name:"nkpro-cloud-snapshot-2026-11-21T19-34-02-"+original.snapshotId+".json",
  mimeType:"application/json",size:"8000",parents:[old.id],
  createdTime:"2026-11-21T19:34:06.745Z"},uploads=[],calls=[];
 const success=x=>new Response(JSON.stringify(x),{status:200,headers:{"Content-Type":"application/json"}});
 async function fetch(url,opts={}){
  const u=new URL(url),q=u.searchParams.get("q")||"",method=opts.method||"GET";
  calls.push({method,url});
  if(!opts.headers?.get("Authorization")?.startsWith("Bearer "))
   return new Response("",{status:401});
  if(u.pathname==="/drive/v3/files"&&method==="GET"){
   if(q.includes("mimeType = 'application/vnd.google-apps.folder'"))
    return success({files:q.includes("NK-Pro 2.0")?[next]:[old]});
   if(q.includes("in parents"))return success({files:[metadata]});
   if(q.includes("nkpro2-vault-v1-"))return success({files:uploads.map(x=>x.meta)});
   throw Error("Unknown list query "+q);
  }
  if(u.pathname.startsWith("/drive/v3/files/")&&method==="GET"){
   const id=u.pathname.split("/").pop(),value=id===metadata.id?original:
    uploads.find(x=>x.meta.id===id)?.payload;
   return value?success(value):new Response("",{status:404});
  }
  if(u.pathname==="/upload/drive/v3/files"&&method==="POST"){
   const text=await opts.body.text(),boundary=opts.body.type.split("boundary=")[1];
   const parts=text.split("--"+boundary).filter(x=>x.includes("Content-Type: application/json"));
   assert.equal(parts.length,2);
   const [meta,payload]=parts.map(x=>JSON.parse(x.slice(x.indexOf("\r\n\r\n")+4).trim()));
   const entry={meta:{...meta,id:"new-file-"+(uploads.length+1)},payload};
   uploads.push(entry);return success(entry.meta);
  }
  throw Error("Unknown request "+method+" "+u.pathname);
 }
 const drive=adapter.create({fetch,testMode:true});
 drive.injectAccessTokenForTest("mock-access");
 return {drive,calls,uploads,original,metadata};
}
test("Read original 1.0 Drive backup and store only old archives plus master as separate encrypted 2.0 snapshot",async()=>{
 const fake=mock(),list=await fake.drive.legacySnapshots();
 assert.equal(list.length,1);
 const original=await fake.drive.readLegacySnapshot(list[0].id);
 const migrated=model.migrate(original),info=model.summary(migrated);
 assert.equal(info.objectCount,1);assert.equal(info.apartments,7);
 assert.equal(info.tenancies,5);assert.equal(info.archiveCount,5);
 assert.deepEqual(info.years,["2024","2023","2023","2022","2021/2022"]);
 assert.equal(info.year2025Migrated,false);
 assert.equal(info.current2025CostCount,0);
 assert.equal(migrated.objects[0].annual["2025"].meterReadings.length,0);
 const encrypted=await cipher.encrypt(migrated,pass,{vaultId:"nkpro2-main",parentId:null});
 const created=await fake.drive.uploadEnvelope(encrypted,null);
 assert.equal(created.count,1);
 assert.equal(fake.uploads[0].meta.parents[0],"1-new");
 assert.equal(JSON.stringify(encrypted).includes("Synthetic Tenant"),false);
 assert.deepEqual(await cipher.decrypt(await fake.drive.read(created.fileId),pass),JSON.parse(JSON.stringify(migrated)));
 assert.ok(fake.calls.filter(x=>x.method!=="GET").every(x=>!x.url.includes("1-old")));
 assert.deepEqual(fake.original,original);
});
test("Reject files not in the original folder and mismatched legacy ids",async()=>{
 const fake=mock();
 await assert.rejects(()=>fake.drive.readLegacySnapshot("some-other-file"),/LEGACY_SOURCE_NOT_ACCESSIBLE/);
 fake.metadata.name="nkpro-cloud-snapshot-not-the-original.json";
 const [item]=await fake.drive.legacySnapshots();
 await assert.rejects(()=>fake.drive.readLegacySnapshot(item.id),/LEGACY_SOURCE_FORMAT_MISMATCH/);
 assert.equal(fake.uploads.length,0);
});
test("Reject source with changed checksum before creating a 2.0 payload",async()=>{
 const invalid=source();invalid.data.stammdaten.mieter[0].name="Corrupted Test Name";
 const fake=mock(invalid),list=await fake.drive.legacySnapshots();
 const read=await fake.drive.readLegacySnapshot(list[0].id);
 assert.throws(()=>model.migrate(read),/SOURCE_INTEGRITY_FAILED/);
 assert.equal(fake.uploads.length,0);
});
