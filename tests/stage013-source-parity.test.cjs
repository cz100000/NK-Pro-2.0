"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const base=path.join(__dirname,"..");
function gitHash(text){return crypto.createHash("sha1")
 .update("blob "+Buffer.byteLength(text)+"\0").update(text).digest("hex");}
const refs=[
 {original:"tests/reference/document-renderer-v99.4.86.js",
  adapted:"legacy-letter-engine.js",sha:"d658a20217c920d8bf64b169f462ce47b3df927b"},
 {original:"tests/reference/landlord-documents-v99.4.86.js",
  adapted:"legacy-landlord-documents.js",sha:"c95d7ba7f1b8b34fdb87c0de1f343678bbdbc303"}
];
for(const ref of refs){
 test("0.13 pinned original "+ref.original+" matches NK-Pro 1.0 git object",()=>{
  const orig=fs.readFileSync(path.join(base,ref.original),"utf8");
  assert.equal(gitHash(orig),ref.sha);
 });
 test("0.13 ported renderer retains all original lines except isolated closure",()=>{
  const orig=fs.readFileSync(path.join(base,ref.original),"utf8");
  const port=fs.readFileSync(path.join(base,ref.adapted),"utf8");
  const nested=orig.replace(/\}\)\(globalThis\);\s*$/,"})(namespace);");
  assert.ok(port.includes(nested),"The original renderer code or A4 CSS was modified");
  assert.match(port,/FACHTEST|synthetic|synthetisch/i);
 });
}
