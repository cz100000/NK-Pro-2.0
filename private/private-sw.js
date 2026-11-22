/* NK-Pro 2.0 private app shell only. NO personal data, API or Google responses in CacheStorage. */
"use strict";
const CACHE="nkpro2-private-static-2026-11-22-v1";
const ASSETS=["./","./index.html","./private.css","./private-model.js",
 "./vault-crypto.js","./drive-adapter.js","./private-app.js","./private.webmanifest"];
self.addEventListener("install",event=>event.waitUntil(
 caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())
));
self.addEventListener("activate",event=>event.waitUntil(
 caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("nkpro2-private-static-")&&k!==CACHE)
  .map(k=>caches.delete(k)))).then(()=>self.clients.claim())
));
self.addEventListener("fetch",event=>{
 const req=event.request;
 if(req.method!=="GET"||new URL(req.url).origin!==self.location.origin)return;
 const url=new URL(req.url),pathname=url.pathname;
 const allowed=ASSETS.some(s=>{
  const u=new URL(s,self.registration.scope);
  return u.pathname===pathname;
 });
 if(!allowed)return;
 event.respondWith(caches.open(CACHE).then(async cache=>{
  const hit=await cache.match(req,{ignoreSearch:true});
  if(hit)return hit;
  const response=await fetch(req);
  if(response.ok&&response.type==="basic")await cache.put(req,response.clone());
  return response;
 }));
});
