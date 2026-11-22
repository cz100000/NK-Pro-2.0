"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
if(!globalThis.crypto)globalThis.crypto=require("node:crypto").webcrypto;
const crypto=require("../private/vault-crypto.js");
test("AES-256-GCM vault survives round-trip without exposing private records in JSON",async()=>{
 const payload={format:"nkpro2-private-portfolio-v1",tenant:"Only In Ciphertext",sum:1642.31};
 const encrypted=await crypto.encrypt(payload,"Synthetic Long Passphrase 2026",{
  vaultId:"synthetic",parentId:"PARENT-1"});
 assert.equal(encrypted.algorithm,"AES-256-GCM");
 assert.equal(encrypted.iterations,310000);
 assert.equal(encrypted.parentId,"PARENT-1");
 assert.equal(JSON.stringify(encrypted).includes(payload.tenant),false);
 assert.deepEqual(await crypto.decrypt(encrypted,"Synthetic Long Passphrase 2026"),payload);
});
test("AEAD rejects altered parent linkage, ciphertext and bad passphrase",async()=>{
 const base=await crypto.encrypt({a:1},"Synthetic Long Passphrase 2026",{
  parentId:"parent-one"});
 await assert.rejects(()=>crypto.decrypt({...base,parentId:"parent-two"},
  "Synthetic Long Passphrase 2026"),/VAULT_AUTHENTICATION_FAILED/);
 await assert.rejects(()=>crypto.decrypt(base,"Incorrect Long Password 2026"),
  /VAULT_AUTHENTICATION_FAILED/);
 await assert.rejects(()=>crypto.decrypt({...base,ciphertext:base.ciphertext.slice(0,-4)+"AAAA"},
  "Synthetic Long Passphrase 2026"),/VAULT_AUTHENTICATION_FAILED/);
});
test("Refuse short passphrases, invalid envelopes and unsupported algorithms",async()=>{
 await assert.rejects(()=>crypto.encrypt({},"1234567"),/VAULT_PASSPHRASE_MIN_14/);
 await assert.rejects(()=>crypto.decrypt({format:"unexpected"},"Synthetic Long Passphrase 2026"),
  /VAULT_ENVELOPE_INVALID/);
 const base=await crypto.encrypt({ok:true},"Synthetic Long Passphrase 2026");
 await assert.rejects(()=>crypto.decrypt({...base,iterations:1000},
  "Synthetic Long Passphrase 2026"),/VAULT_ENVELOPE_INVALID/);
});
