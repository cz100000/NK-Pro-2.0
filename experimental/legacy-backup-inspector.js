/* NK-Pro 2.0 – read-only legacy JSON inspection contract.
 * No file-system, browser storage, migration, restoration, logging or data upload.
 * The ONLY output is shape, checksum outcome and aggregate counts.
 * This is an EXPERIMENTAL OFFLINE LIBRARY and is not loaded by the UX demo.
 */
(function(root,factory){
"use strict";
const api=Object.freeze(factory());
if(typeof module!=="undefined"&&module.exports)module.exports=api;
else root.NKPRO2_LEGACY_INSPECTOR=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const FORMAT="nk-pro-backup-envelope", VERSION=1;
const plain=value=>value!==null&&typeof value==="object"&&!Array.isArray(value);
function hash(value){
 let h=0x811c9dc5,text=String(value??"");
 for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,0x01000193)}
 return(h>>>0).toString(16).padStart(8,"0");
}
function validateEnvelope(envelope){
 const errors=[];
 if(!plain(envelope))return{valid:false,errors:["INVALID_ENVELOPE"]};
 if(envelope.format!==FORMAT)errors.push("UNKNOWN_FORMAT");
 if(envelope.formatVersion!==VERSION)errors.push("UNSUPPORTED_VERSION");
 const metadata=envelope.metadata;
 if(!plain(metadata)||!("data" in envelope))return{valid:false,errors:[...errors,"MISSING_METADATA_OR_DATA"]};
 const required=["backupId","backupType","createdAt","payloadChecksum","metadataChecksum","checksumAlgorithm"];
 for(const key of required)if(!String(metadata[key]||"").trim())errors.push("MISSING_"+key.toUpperCase());
 if(!Number.isFinite(Date.parse(String(metadata.createdAt||""))))errors.push("INVALID_TIMESTAMP");
 for(const key of ["sourceSchemaVersion","targetSchemaVersion","dataLayerContractVersion"])
  if(!Number.isFinite(Number(metadata[key]))||Number(metadata[key])<1)errors.push("INVALID_"+key.toUpperCase());
 if(!Array.isArray(metadata.migrationPath))errors.push("INVALID_MIGRATION_PATH");
 if(metadata.checksumAlgorithm!=="FNV1A32")errors.push("UNKNOWN_CHECKSUM_ALGORITHM");
 const metaCopy={...metadata};delete metaCopy.metadataChecksum;
 if(hash(JSON.stringify(envelope.data))!==metadata.payloadChecksum)errors.push("PAYLOAD_CHECKSUM");
 if(hash(JSON.stringify(metaCopy))!==metadata.metadataChecksum)errors.push("METADATA_CHECKSUM");
 if(hash(JSON.stringify({format:envelope.format,formatVersion:envelope.formatVersion,metadata:envelope.metadata,data:envelope.data}))!==envelope.envelopeChecksum)errors.push("ENVELOPE_CHECKSUM");
 return{valid:errors.length===0,errors};
}
function summarizeState(data){
 if(!plain(data)||!Array.isArray(data.wohnungen)||!Array.isArray(data.mieter)||!Array.isArray(data.kostenarten))
   return{valid:false,errors:["MISSING_CORE_STATE_ARRAYS"]};
 const meta=plain(data.meta)?data.meta:{};
 const schema=Number(meta.dataSchemaVersion);
 return{valid:true,errors:[],schemaVersion:Number.isFinite(schema)&&schema>0?schema:null,
   periodYear:/^\d{4}$/.test(String(meta.abrechnungsjahr||""))?String(meta.abrechnungsjahr):null,
   counts:{units:data.wohnungen.length,tenancies:data.mieter.length,costs:data.kostenarten.length,
     archives:Array.isArray(data.jahresArchiv)?data.jahresArchiv.length:0}};
}
function inspect(value){
 if(plain(value)&&value.format===FORMAT){
   const verify=validateEnvelope(value);
   if(!verify.valid)return{ok:false,kind:"legacy-envelope",integrity:"failed",errors:verify.errors};
   const state=summarizeState(value.data);
   if(!state.valid)return{ok:false,kind:"legacy-envelope",integrity:"verified",errors:state.errors};
   return{ok:true,kind:"legacy-envelope",integrity:"verified",schemaVersion:state.schemaVersion,
     periodYear:state.periodYear,counts:state.counts,sourceSchemaVersion:Number(value.metadata.sourceSchemaVersion)};
 }
 const state=summarizeState(value);
 if(!state.valid)return{ok:false,kind:"unknown",integrity:"unknown",errors:state.errors};
 return{ok:true,kind:"legacy-raw-export",integrity:"not-provided",schemaVersion:state.schemaVersion,
   periodYear:state.periodYear,counts:state.counts,
   warning:"Raw JSON has no embedded checksum. Do not restore until separately verified."};
}
return{inspect,validateEnvelope,hash,version:"offline-inspector-experimental-1"};
});
