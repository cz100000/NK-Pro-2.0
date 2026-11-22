#!/usr/bin/env node
"use strict";
/* Only private static app sources, never personal data nor public synthetic demo. */
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),target=path.resolve(root,"dist-private");
const allowed=["index.html","private.css","private-model.js","vault-crypto.js",
 "drive-adapter.js","private-app.js","private-sw.js","private.webmanifest"];
if(fs.existsSync(target))fs.rmSync(target,{recursive:true,force:true});
fs.mkdirSync(target,{recursive:true});
for(const name of allowed){
 const source=path.join(root,"private",name);
 if(!fs.statSync(source).isFile())throw Error("Missing private static asset "+name);
 fs.copyFileSync(source,path.join(target,name));
}
const headers=[
 "/*",
 "  Referrer-Policy: no-referrer",
 "  X-Content-Type-Options: nosniff",
 "  X-Frame-Options: DENY",
 "  Cross-Origin-Opener-Policy: same-origin-allow-popups",
 "  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()",
 "  Content-Security-Policy: default-src 'self'; script-src 'self' https://accounts.google.com https://apis.google.com; connect-src 'self' https://www.googleapis.com https://accounts.google.com; frame-src https://accounts.google.com; style-src 'self'; img-src 'self' data: https://*.googleusercontent.com; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests",
 "/private-sw.js",
 "  Cache-Control: no-cache",
 ""
].join("\n");
fs.writeFileSync(path.join(target,"_headers"),headers);
const files=fs.readdirSync(target).sort();
if(files.length!==allowed.length+1||files.some(x=>!allowed.includes(x)&&x!=="_headers"))
 throw Error("Private hosting allowlist mismatch");
console.log("PRIVATE_SITE_BUILD_OK: "+files.length+" static files, no source data; output dist-private/");
