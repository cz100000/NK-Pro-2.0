"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const root=require("node:path").resolve(__dirname,"..");
const file=name=>fs.readFileSync(require("node:path").join(root,name),"utf8");
test("Integrated Google Drive client but no standalone vault or real data is published to GitHub Pages",()=>{
 const pages=file(".github/workflows/pages.yml"),publicHtml=file("index.html");
 const privateHtml=file("private/index.html"),app=file("private/private-app.js");
 const allowed=["private-model.js","vault-crypto.js","drive-adapter.js"];
 for(const name of allowed)
  assert.ok(fs.existsSync(require("node:path").join(root,"private",name)));
 assert.ok(privateHtml.includes("noindex,nofollow"));
 assert.ok(privateHtml.includes('Content-Security-Policy'));
 assert.match(file("integrated-app.js"),/nkpro2_live_cloud_encrypted_v1/);
 assert.match(file("integrated-data.js"),/master-and-pre-2025-archives-only/);
 assert.ok(!publicHtml.includes("private/private-app.js"));
 assert.ok(publicHtml.includes("id=\"nkSyncButton\""));
 assert.ok(publicHtml.includes("./integrated-app.js"));
 assert.match(pages,/mkdir -p _site\/private/);
 assert.match(pages,/test "\$\(find _site -type f \| wc -l\)" -eq 29/);
 assert.ok(!pages.includes("cp -r private/"));
 assert.ok(!pages.includes("cp private/*"));
 for(const name of allowed)assert.ok(pages.includes("private/"+name));
 for(const name of ["integrated-app.js","integrated-data.js","integrated-ui.css"])
  assert.ok(pages.includes("cp integrated-data.js integrated-app.js integrated-ui.css nkpro2-sw.js nkpro2.webmanifest _site/"));
 assert.ok(pages.includes("test ! -e _site/private/index.html"));
 assert.ok(!/cp private\/index\.html/.test(pages));
 assert.ok(!/cp\s+[^\n]*nkpro-cloud-snapshot/.test(pages));
 assert.ok(!/cp\s+[^\n]*sourceEvidence\.json/.test(pages));
 assert.ok(!/cp\s+[^\n]*private-data\//.test(pages));
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
