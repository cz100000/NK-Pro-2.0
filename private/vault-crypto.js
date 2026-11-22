/* NK-Pro 2.0 encrypted local/cloud vault. Independent WebCrypto implementation. */
(function(root,factory){"use strict";const api=Object.freeze(factory());
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
 else root.NKPRO2_VAULT_CRYPTO=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){"use strict";
 const FORMAT="nkpro2-encrypted-vault-v1",ITERATIONS=310000;
 const enc=new TextEncoder(),dec=new TextDecoder();
 function cryptoAPI(){
  const c=globalThis.crypto;
  if(!c||!c.subtle||!c.getRandomValues)throw new Error("SECURE_WEBCRYPTO_REQUIRED");
  return c;
 }
 function base64(bytes){
  if(typeof Buffer!=="undefined")return Buffer.from(bytes).toString("base64");
  let out="";for(let i=0;i<bytes.length;i+=32768)
   out+=String.fromCharCode(...bytes.subarray(i,i+32768));
  return btoa(out);
 }
 function unbase64(str){
  if(typeof str!=="string"||!/^[A-Za-z0-9+/]*={0,2}$/.test(str)||str.length%4)
   throw new Error("VAULT_BASE64_INVALID");
  if(typeof Buffer!=="undefined")return Uint8Array.from(Buffer.from(str,"base64"));
  const s=atob(str),a=new Uint8Array(s.length);
  for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a;
 }
 function metadata(e){return {format:e.format,schemaVersion:e.schemaVersion,
   vaultId:e.vaultId,parentId:e.parentId,createdAt:e.createdAt};}
 async function derive(password,salt){
  if(typeof password!=="string"||password.length<14)
   throw new Error("VAULT_PASSPHRASE_MIN_14");
  const c=cryptoAPI();
  const secret=await c.subtle.importKey("raw",enc.encode(password),"PBKDF2",false,["deriveKey"]);
  return c.subtle.deriveKey({name:"PBKDF2",salt,iterations:ITERATIONS,hash:"SHA-256"},
   secret,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
 }
 async function encrypt(value,password,options={}){
  if(value===undefined)throw new Error("VAULT_PAYLOAD_MISSING");
  const c=cryptoAPI(),salt=c.getRandomValues(new Uint8Array(16)),
   iv=c.getRandomValues(new Uint8Array(12));
  const e={format:FORMAT,schemaVersion:1,vaultId:options.vaultId||"nkpro2-main",
   parentId:options.parentId||null,createdAt:new Date().toISOString()};
  const key=await derive(password,salt),aad=enc.encode(JSON.stringify(metadata(e)));
  const cy=await c.subtle.encrypt({name:"AES-GCM",iv,additionalData:aad,tagLength:128},
   key,enc.encode(JSON.stringify(value)));
  return {...e,kdf:"PBKDF2-SHA256",iterations:ITERATIONS,algorithm:"AES-256-GCM",
   salt:base64(salt),iv:base64(iv),ciphertext:base64(new Uint8Array(cy))};
 }
 async function decrypt(e,password){
  if(!e||e.format!==FORMAT||e.schemaVersion!==1||
   e.iterations!==ITERATIONS||e.kdf!=="PBKDF2-SHA256"||
   e.algorithm!=="AES-256-GCM"||typeof e.vaultId!=="string"||
   typeof e.createdAt!=="string")throw new Error("VAULT_ENVELOPE_INVALID");
  const salt=unbase64(e.salt),iv=unbase64(e.iv),cipher=unbase64(e.ciphertext);
  if(salt.length!==16||iv.length!==12||cipher.length<17)
   throw new Error("VAULT_ENVELOPE_LENGTH");
  const key=await derive(password,salt),aad=enc.encode(JSON.stringify(metadata(e)));
  try{
   const pt=await cryptoAPI().subtle.decrypt({name:"AES-GCM",iv,
    additionalData:aad,tagLength:128},key,cipher);
   return JSON.parse(dec.decode(pt));
  }catch(_){throw new Error("VAULT_AUTHENTICATION_FAILED");}
 }
 return Object.freeze({FORMAT,ITERATIONS,encrypt,decrypt});
});