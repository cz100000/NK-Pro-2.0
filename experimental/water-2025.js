/* NK-Pro 2.0 - experimental, read-only water 2025 parity module.
   Not bundled into the public demo; never change V99.4.86 stored data. */
(function(root,factory){
"use strict";
const api=Object.freeze(factory());
if(typeof module!=="undefined"&&module.exports)module.exports=api;
else root.NKPRO2_EXPERIMENTAL_WATER=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const isValue=v=>v!==undefined&&v!==null&&v!==""&&Number.isFinite(Number(v));
const num=v=>Number(v);
function confirmedWhole2025(data,costId="K002"){
 const meta=data&&data.meta||{},evidence=meta.confirmed2025Evidence&&meta.confirmed2025Evidence.water;
 return String(costId)==="K002"&&String(meta.abrechnungsjahr)==="2025"&&
   !!(evidence&&evidence.houseConsumption===275&&evidence.readingDate==="2025-12-30");
}
function meterConsumption(row,prefix,data,costId="K002"){
 if(!row||!isValue(row[prefix+"Start"])||!isValue(row[prefix+"End"]))return 0;
 const start=num(row[prefix+"Start"]),end=num(row[prefix+"End"]);
 if(end<start)return 0; // unchanged from original billing-calculation.js
 return confirmedWhole2025(data,costId)?Math.max(0,Math.round(end)-Math.round(start)):end-start;
}
const totalForRow=(row,data,costId="K002")=>
 meterConsumption(row,"kw",data,costId)+meterConsumption(row,"ww",data,costId);
function totalForTenant(data,index,costId="K002"){
 if(!confirmedWhole2025(data,costId))throw new RangeError("Only the confirmed K002/2025 compatibility path is implemented");
 const row=data&&data.waterMeters&&Array.isArray(data.waterMeters.readings)?
   data.waterMeters.readings[index]:null;
 if(row&&(isValue(row.kwEnd)||isValue(row.wwEnd)))return totalForRow(row,data,costId);
 return 0; // mirrors original: missing values are NOT substituted or spread
}
function diagnostics(data,costId="K002"){
 if(!confirmedWhole2025(data,costId))return{supported:false,issues:[{code:"UNCONFIRMED_WATER_PERIOD"}]};
 const readings=data.waterMeters&&Array.isArray(data.waterMeters.readings)?data.waterMeters.readings:[];
 const house=Number(data.waterMeters&&data.waterMeters.settings&&data.waterMeters.settings.houseWaterTotal);
 const issues=[],rows=[];
 for(let i=0;i<readings.length;i++){
   const row=readings[i]||{};
   const fields=["kwStart","kwEnd","wwStart","wwEnd"];
   if(fields.some(k=>!isValue(row[k])))issues.push({code:"MISSING_READING",index:i});
   if(["kw","ww"].some(prefix=>isValue(row[prefix+"Start"])&&isValue(row[prefix+"End"])&&num(row[prefix+"End"])<num(row[prefix+"Start"])))
     issues.push({code:"REVERSED_READING",index:i});
   if(fields.some(k=>isValue(row[k])&&num(row[k])<0))
     issues.push({code:"NEGATIVE_READING",index:i});
   rows.push({index:i,cold:meterConsumption(row,"kw",data,costId),hot:meterConsumption(row,"ww",data,costId),
     total:totalForRow(row,data,costId)});
 }
 if(!Number.isFinite(house)||house<=0)issues.push({code:"INVALID_HOUSE_CONSUMPTION"});
 const units=rows.reduce((sum,r)=>sum+r.total,0);
 const gap=Number.isFinite(house)?house-units:null;
 if(gap!==null&&Math.abs(gap)>.01)issues.push({code:"HOUSE_UNITS_DIFFERENCE",gap});
 return{supported:true,house:Number.isFinite(house)?house:null,units,gap,rows,issues,
   status:issues.length?"review-required":"complete",unallocatedGap:gap};
}
function carryForward(prior,working){
 const result=JSON.parse(JSON.stringify(working||{}));
 if(!result.waterMeters||!Array.isArray(result.waterMeters.readings))throw new TypeError("Working state has no meter rows");
 const old=prior&&prior.waterMeters&&prior.waterMeters.readings;
 if(!Array.isArray(old))throw new TypeError("Prior year has no meter rows");
 const changes=[],issues=[];
 for(let i=0;i<result.waterMeters.readings.length;i++){
   const r=result.waterMeters.readings[i],o=old[i];
   if(!r||!o){issues.push({code:"MISSING_METER_PAIR",index:i});continue;}
   // Strict positional binding is limited to synthetically verified fixtures.
   if(!r.meterId||!o.meterId||r.meterId!==o.meterId){
     issues.push({code:"METER_IDENTITY_NOT_MATCHED",index:i});continue;
   }
   for(const prefix of ["kw","ww"]){
     const key=prefix+"Start",oldEnd=prefix+"End";
     if(isValue(r[key]))continue; // NEVER overwrite entered current-year readings
     if(!isValue(o[oldEnd])||!Number.isSafeInteger(num(o[oldEnd]))||num(o[oldEnd])<0){
       issues.push({code:"PRIOR_END_NOT_WHOLE",index:i,meter:prefix});continue;
     }
     r[key]=num(o[oldEnd]);
     changes.push({index:i,meter:prefix,value:r[key],from:"prior-end",meterId:r.meterId});
   }
 }
 return{draft:result,changes,issues,committed:false};
}
return{confirmedWhole2025,meterConsumption,totalForRow,totalForTenant,diagnostics,carryForward,version:"water-2025-parity-1"};
});
