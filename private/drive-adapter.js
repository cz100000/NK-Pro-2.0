/* NK-Pro 2.0: independent Google Drive v3 append-only encrypted vault adapter.
   No production data shipped with code; no secrets, no legacy storage keys.
   Parent-ID checks detect stale clients; fork detection fails closed. */
(function(root,factory){"use strict";const api=Object.freeze(factory());
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
 else root.NKPRO2_PRIVATE_DRIVE=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){"use strict";
 const API="https://www.googleapis.com/drive/v3/files";
 const UPLOAD="https://www.googleapis.com/upload/drive/v3/files";
 const PREFIX="nkpro2-vault-v1-",FOLDER="NK-Pro 2.0 – Privatdaten";
 const SCOPE="https://www.googleapis.com/auth/drive.file";
 const bad=(code)=>{throw new Error(code);};
 function create(options={}){
  const net=options.fetch||globalThis.fetch;
  if(typeof net!=="function")throw new Error("FETCH_REQUIRED");
  let accessToken="",expiresAt=0,folderId="",activeClientId="";
  const isConnected=()=>!!accessToken&&Date.now()<expiresAt-30000;
  async function request(url,init={}){
   if(!isConnected())bad("GOOGLE_SIGN_IN_REQUIRED");
   if(globalThis.navigator&&globalThis.navigator.onLine===false)bad("OFFLINE");
   const headers=new Headers(init.headers||{});
   headers.set("Authorization","Bearer "+accessToken);
   const response=await net(url,{...init,headers,cache:"no-store"});
   if(!response.ok){
    if(response.status===401||response.status===403){accessToken="";expiresAt=0;}
    throw new Error("GOOGLE_DRIVE_HTTP_"+response.status);
   }
   return response;
  }
  async function signIn(clientId){
   if(!/^[0-9]{8,}-[\w-]+\.apps\.googleusercontent\.com$/.test(clientId||""))
    bad("GOOGLE_CLIENT_ID_INVALID");
   if(!globalThis.google?.accounts?.oauth2){
    await new Promise((resolve,reject)=>{
     if(!globalThis.document)reject(new Error("BROWSER_REQUIRED"));
     else{const script=document.createElement("script");
      script.src="https://accounts.google.com/gsi/client";script.async=true;
      script.onload=resolve;script.onerror=()=>reject(new Error("GOOGLE_IDENTITY_LOAD_FAILED"));
      document.head.appendChild(script);}
    });
   }
   const response=await new Promise((resolve,reject)=>{
    const client=globalThis.google.accounts.oauth2.initTokenClient({
     client_id:clientId,scope:SCOPE,
     callback:result=>result?.error?reject(new Error("GOOGLE_OAUTH_"+result.error)):resolve(result),
     error_callback:()=>reject(new Error("GOOGLE_OAUTH_CANCELLED"))
    });
    client.requestAccessToken({prompt:"select_account"});
   });
   if(!response?.access_token)bad("GOOGLE_OAUTH_NO_TOKEN");
   accessToken=response.access_token;
   expiresAt=Date.now()+Math.max(0,Number(response.expires_in||0))*1000;
   folderId="";activeClientId=clientId;
   return {connected:true,expiresAt};
  }
  function signOut(){accessToken="";expiresAt=0;folderId="";activeClientId="";}
  function injectAccessTokenForTest(token,seconds=3600){
   if(options.testMode!==true)bad("TEST_MODE_ONLY");
   accessToken=token;expiresAt=Date.now()+seconds*1000;
  }
  async function listAll(query,fields){
   const result=[];let pageToken="";
   do{
    const queryParams=new URLSearchParams({
     q:query,pageSize:"100",spaces:"drive",fields:"nextPageToken,files("+fields+")",
     orderBy:"createdTime desc"
    });
    if(pageToken)queryParams.set("pageToken",pageToken);
    const j=await(await request(API+"?"+queryParams)).json();
    result.push(...(j.files||[]));pageToken=j.nextPageToken||"";
    if(result.length>2500)bad("DRIVE_SNAPSHOT_LIMIT_REACHED");
   }while(pageToken);
   return result;
  }
  async function locateFolder(createIfMissing){
   if(folderId)return folderId;
   const found=await listAll("name = '"+FOLDER+"' and mimeType = 'application/vnd.google-apps.folder' and trashed = false","id,name,mimeType");
   if(found.length>1)bad("DRIVE_FOLDER_AMBIGUOUS");
   if(found.length){folderId=found[0].id;return folderId;}
   if(!createIfMissing)return null;
   const created=await(await request(API+"?fields=id,name",{method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({name:FOLDER,mimeType:"application/vnd.google-apps.folder"})})).json();
   if(!created?.id)bad("DRIVE_FOLDER_CREATE_FAILED");
   folderId=created.id;return folderId;
  }
  async function history(){
   const files=await listAll("name contains '"+PREFIX+"' and trashed = false",
    "id,name,createdTime,parents,appProperties");
   const filtered=files.filter(f=>String(f.name||"").startsWith(PREFIX)&&
    f.appProperties?.nkpro2Vault==="1");
   const byParent=new Map();
   for(const f of filtered){
    const parent=f.appProperties?.parentDriveId||"ROOT";
    if(!byParent.has(parent))byParent.set(parent,[]);
    byParent.get(parent).push(f);
   }
   const forks=[...byParent].filter(([,list])=>list.length>1);
   if(forks.length)bad("DRIVE_DIVERGENT_HISTORY");
   /* Time is used only for display; parent links determine unique active head. */
   const children=new Set(filtered.map(f=>f.appProperties?.parentDriveId).filter(Boolean));
   const heads=filtered.filter(f=>!children.has(f.id));
   if((filtered.length>0&&heads.length!==1)||heads.length>1)bad("DRIVE_MULTIPLE_HEADS");
   const known=new Set(filtered.map(f=>f.id));
   for(const f of filtered){const parent=f.appProperties?.parentDriveId;
    if(parent&&!known.has(parent))bad("DRIVE_MISSING_ANCESTOR");}
   return {head:heads[0]||null,count:filtered.length};
  }
  async function read(encryptedFileId){
   if(!encryptedFileId)bad("DRIVE_FILE_ID_REQUIRED");
   const body=await(await request(API+"/"+encodeURIComponent(encryptedFileId)+"?alt=media")).json();
   if(body?.format!=="nkpro2-encrypted-vault-v1")bad("DRIVE_NOT_ENCRYPTED_VAULT");
   return body;
  }
  async function uploadEnvelope(envelope,expectedHeadId){
   if(!envelope||envelope.format!=="nkpro2-encrypted-vault-v1")bad("ENCRYPTED_ENVELOPE_REQUIRED");
   const current=await history(),headId=current.head?.id||null;
   if(headId!==(expectedHeadId||null))bad("DRIVE_SYNC_CONFLICT");
   if((envelope.parentId||null)!==headId)bad("DRIVE_PARENT_MISMATCH");
   const directory=await locateFolder(true);
   const name=PREFIX+envelope.createdAt.replace(/[:.]/g,"-")+"-"+globalThis.crypto.randomUUID()+".json";
   const metadata={name,mimeType:"application/json",parents:[directory],
    appProperties:{nkpro2Vault:"1",parentDriveId:headId||"",vaultId:envelope.vaultId}};
   const boundary="nkpro2"+globalThis.crypto.randomUUID().replace(/-/g,"");
   const blob=new Blob(["--"+boundary+"\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n",
    JSON.stringify(metadata),"\r\n--"+boundary+
    "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n",
    JSON.stringify(envelope),"\r\n--"+boundary+"--"],{type:"multipart/related; boundary="+boundary});
   const uploaded=await(await request(UPLOAD+"?uploadType=multipart&fields=id,name,createdTime,appProperties",
    {method:"POST",headers:{"Content-Type":blob.type},body:blob})).json();
   if(!uploaded?.id)bad("DRIVE_UPLOAD_MISSING_ID");
   const check=await read(uploaded.id);
   if(JSON.stringify(check)!==JSON.stringify(envelope))bad("DRIVE_UPLOAD_VERIFY_FAILED");
   const after=await history();
   if(after.head?.id!==uploaded.id)bad("DRIVE_POST_UPLOAD_CONFLICT");
   return {fileId:uploaded.id,count:after.count};
  }
  return Object.freeze({signIn,signOut,isConnected,history,read,uploadEnvelope,
    locateFolder,getOAuthClientId:()=>activeClientId,
    injectAccessTokenForTest});
 }
 return Object.freeze({create,PREFIX,FOLDER,SCOPE});
});