"use strict";
/* NK-Pro 2.0 offline shell only: no personal data or Google API response caching. */
const NAME="nkpro2-canonical-v013-2026-11-22-v2";
const ASSETS=["./","./index.html","./styles.css","./integrated-ui.css",
 "./demo-ledger.js","./experimental/settlement-cost.js","./water-detail.js",
 "./synthetic-billing.js","./synthetic-property.js","./synthetic-workflow.js",
 "./synthetic-case-billing.js","./synthetic-letters.js","./legacy-letter-engine.js",
 "./letter-workspace-ui.js","./legacy-landlord-documents.js","./synthetic-review.js",
 "./synthetic-estate.js","./synthetic-master-ui.js","./private/private-model.js",
 "./private/vault-crypto.js","./private/drive-adapter.js","./integrated-data.js",
 "./navigation-tree.js","./portfolio-view-model.js","./integrated-app.js","./app.js","./nkpro2.webmanifest","./nkpro2-sw.js"];
self.addEventListener("install",event=>event.waitUntil(
 caches.open(NAME).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())
));
self.addEventListener("activate",event=>event.waitUntil(
 caches.keys().then(keys=>Promise.all(keys.filter(k=>
  (k.startsWith("nkpro2-integrated-shell-")||k.startsWith("nkpro2-canonical-v013-"))&&k!==NAME).map(k=>caches.delete(k))))
  .then(()=>self.clients.claim())
));
self.addEventListener("fetch",event=>{
 const r=event.request;
 if(r.method!=="GET")return;
 const u=new URL(r.url);
 if(u.origin!==self.location.origin)return;
 if(!ASSETS.some(asset=>new URL(asset,self.registration.scope).pathname===u.pathname))return;
 // Network-first for allowlisted app shell only, so a previously cached v0.16
 // cannot indefinitely shadow new v0.17 UI. Offline uses the last safe shell.
 event.respondWith(caches.open(NAME).then(async cache=>{
  try{
   const online=await fetch(r,{cache:"no-cache"});
   if(online.ok&&online.type==="basic"){
    await cache.put(r,online.clone());return online;
   }
  }catch(_){/* offline -- use only known static shell */ }
  const hit=await cache.match(r,{ignoreSearch:true});
  if(hit)return hit;
  return Response.error();
 }));
});
