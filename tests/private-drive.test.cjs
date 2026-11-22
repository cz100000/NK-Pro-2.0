"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
if(!globalThis.crypto)globalThis.crypto=require("node:crypto").webcrypto;
const vault=require("../private/vault-crypto.js");
const drive=require("../private/drive-adapter.js");
function fakeGoogle(){
 const files=[],folder={id:"folder-2",name:"NK-Pro 2.0 – Privatdaten",
  mimeType:"application/vnd.google-apps.folder"},network=[];
 let counter=1;
 const ok=x=>new Response(JSON.stringify(x),{status:200,headers:{"content-type":"application/json"}});
 async function fetch(url,options={}){
  network.push({url,method:options.method||"GET"});
  const parsed=new URL(url),method=options.method||"GET";
  if(!options.headers?.get("Authorization")?.startsWith("Bearer "))
   return new Response("",{status:401});
  if(parsed.pathname.endsWith("/files")&&method==="GET"){
   const q=parsed.searchParams.get("q")||"";
   if(q.includes("application/vnd.google-apps.folder"))return ok({files:[folder]});
   return ok({files:files.map(f=>f.metadata)});
  }
  if(parsed.pathname.includes("/upload/drive/v3/files")&&method==="POST"){
   const content=await options.body.text(),boundary=options.body.type.split("boundary=")[1];
   const blocks=content.split("--"+boundary).filter(x=>x.includes("Content-Type: application/json"));
   assert.equal(blocks.length,2);
   const body=blocks.map(x=>JSON.parse(x.slice(x.indexOf("\r\n\r\n")+4).trim()));
   const metadata={...body[0],id:"file-"+counter++,createdTime:new Date().toISOString()};
   files.push({metadata,envelope:body[1]});
   return ok(metadata);
  }
  if(parsed.pathname.startsWith("/drive/v3/files/")&&parsed.searchParams.get("alt")==="media"){
   const f=files.find(x=>x.metadata.id===parsed.pathname.split("/").pop());
   return f?ok(f.envelope):new Response("",{status:404});
  }
  throw new Error("Unexpected request "+method+" "+url);
 }
 return {fetch,files,network};
}
test("Drive adapter writes encrypted versions to new namespace, with parent links",async()=>{
 const fake=fakeGoogle(),client=drive.create({fetch:fake.fetch,testMode:true});
 client.injectAccessTokenForTest("fake-token");
 assert.equal((await client.history()).head,null);
 const one=await vault.encrypt({test:true},"Synthetic Long Passphrase 2026",
  {vaultId:"nkpro2-main",parentId:null});
 const uploaded=await client.uploadEnvelope(one,null);
 assert.equal(uploaded.count,1);
 assert.equal((await client.history()).head.id,uploaded.fileId);
 assert.deepEqual(await vault.decrypt(await client.read(uploaded.fileId),
  "Synthetic Long Passphrase 2026"),{test:true});
 assert.equal(fake.files[0].metadata.parents[0],"folder-2");
 assert.equal(fake.files[0].metadata.name.startsWith(drive.PREFIX),true);
 assert.equal(fake.network.some(x=>x.url.includes("NK-Pro-1.0")),false);
 const two=await vault.encrypt({test:2},"Synthetic Long Passphrase 2026",
  {vaultId:"nkpro2-main",parentId:uploaded.fileId});
 const uploaded2=await client.uploadEnvelope(two,uploaded.fileId);
 assert.equal(uploaded2.count,2);
});
test("Concurrent stale client and forked history are blocked without overwrite",async()=>{
 const fake=fakeGoogle(),one=drive.create({fetch:fake.fetch,testMode:true}),
  stale=drive.create({fetch:fake.fetch,testMode:true});
 one.injectAccessTokenForTest("mock-a");stale.injectAccessTokenForTest("mock-b");
 const first=await vault.encrypt({v:1},"Synthetic Long Passphrase 2026");
 const a=await one.uploadEnvelope(first,null);
 const second=await vault.encrypt({v:2},"Synthetic Long Passphrase 2026",
  {parentId:a.fileId});
 await assert.rejects(()=>stale.uploadEnvelope(second,null),/DRIVE_SYNC_CONFLICT/);
 await one.uploadEnvelope(second,a.fileId);
 fake.files.push({metadata:{...fake.files[1].metadata,id:"forked-file-99"},envelope:second});
 await assert.rejects(()=>one.history(),/DRIVE_DIVERGENT_HISTORY/);
});
