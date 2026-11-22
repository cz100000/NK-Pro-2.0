"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const root=require("node:path").resolve(__dirname,"..");
const file=name=>fs.readFileSync(require("node:path").join(root,name),"utf8");
test("Public GitHub Pages demo cannot publish private vault assets or genuine data",()=>{
 const pages=file(".github/workflows/pages.yml"),publicHtml=file("index.html");
 const privateHtml=file("private/index.html"),app=file("private/private-app.js");
 for(const name of ["private-model.js","vault-crypto.js","drive-adapter.js",
   "private-app.js","private.css","private-sw.js","private.webmanifest"])
  assert.ok(fs.existsSync(require("node:path").join(root,"private",name)));
 assert.ok(privateHtml.includes("noindex,nofollow"));
 assert.ok(privateHtml.includes('Content-Security-Policy'));
 assert.match(app,/location\.hostname\.endsWith\("\.github\.io"\)/);
 assert.ok(!publicHtml.includes("private/private-app.js"));
 assert.ok(!pages.includes("cp private/"));
 assert.ok(!pages.includes("cp -r private/"));
 assert.match(pages,/test "\$\(find _site -type f \| wc -l\)" -eq 21/);
});
test("Service worker caches static shell only, never personal data or Drive response",()=>{
 const sw=file("private/private-sw.js");
 assert.match(sw,/req\.method!=="GET"/);
 assert.match(sw,/new URL\(req\.url\)\.origin!==self\.location\.origin/);
 assert.match(sw,/ASSETS\.some/);
 assert.ok(!sw.includes("nkpro2_private_encrypted_local_v1"));
 assert.ok(!sw.includes("googleapis.com"));
 assert.ok(!sw.includes("apiRequest"));
});
test("No hardcoded plaintext credentials in the new client code",()=>{
 const files=["private/private-model.js","private/vault-crypto.js",
 "private/drive-adapter.js","private/private-app.js"].map(file);
 for(const content of files){
  assert.ok(!/client_secret\s*[:=]/i.test(content));
  assert.ok(!/refresh_token\s*[:=]/i.test(content));
  assert.ok(!/PRIVATE_KEY-----/.test(content));
 }
 assert.match(files[3],/new File|snapshotFile/);
 assert.match(files[1],/AES-GCM/);
});
