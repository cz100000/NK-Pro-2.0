"use strict";
/*
 * NK-Pro 2.0 experimental, offline data-level letter preflight.
 * Does not render letter HTML, print A4, generate PDFs, or release any real bill.
 * Input MUST be an explicitly tagged synthetic fixture; no browser storage/network.
 */
const crypto=require("node:crypto");
function stable(v){
 if(Array.isArray(v))return v.map(stable);
 if(v&&typeof v==="object")return Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])]));
 return v;
}
function fingerprint(input){return crypto.createHash("sha256").update(JSON.stringify(stable(input))).digest("hex");}
const text=v=>String(v??"").trim();
const cents=v=>Number.isSafeInteger(v)&&Math.abs(v)<=Number.MAX_SAFE_INTEGER;
const date=v=>{
 const x=text(v);if(!/^\d{4}-\d{2}-\d{2}$/.test(x))return false;
 const d=new Date(x+"T12:00:00Z");
 return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===x;
};
function prepare(input,{reviewedSignature}={}){
 if(!input||input.fixtureKind!=="synthetic")throw new TypeError("Synthetic-only document preflight");
 const {period,tenant,settings,rows,settlement}=input;
 const errors=[],warnings=[];
 const err=(code,field)=>errors.push({code,field});
 const warn=(code,field)=>warnings.push({code,field});
 if(!tenant||!text(tenant.id))err("MISSING_RECIPIENT","tenant.id");
 for(const prop of ["name","street","postalCode","city"])
  if(!text(tenant&&tenant[prop]))err("MISSING_RECIPIENT_FIELD","tenant."+prop);
 for(const prop of ["senderName","letterDate"])
  if(!text(settings&&settings[prop]))err("MISSING_LETTER_SETTING","settings."+prop);
 if(settings&&text(settings.letterDate)&&!date(settings.letterDate))
  err("INVALID_LETTER_DATE","settings.letterDate");
 if(!period||!date(period.start)||!date(period.end)||period.start>period.end)
  err("INVALID_PERIOD","period");
 if(!settings||!text(settings.signature))warn("MISSING_SIGNATURE","settings.signature");
 if(!settings||!text(settings.bankAccount))warn("MISSING_BANK","settings.bankAccount");
 if(!Array.isArray(rows)||!rows.length)err("NO_BILLING_ROWS","rows");
 if(!settlement||!["costShareCents","prepaymentsCents","correctionCents"].every(k=>cents(settlement[k])))
  err("INVALID_SETTLEMENT_TOTALS","settlement");
 const goodRows=Array.isArray(rows)?rows:[];
 const validIds=new Set();
 for(let i=0;i<goodRows.length;i++){
  const row=goodRows[i]||{};
  if(!text(row.costId)||validIds.has(row.costId))err("DUPLICATE_OR_MISSING_COST_ID","rows["+i+"].costId");
  validIds.add(row.costId);
  if(!text(row.name))err("MISSING_COST_NAME","rows["+i+"].name");
  if(!cents(row.shareCents)||!cents(row.prepaymentCents))
   err("INVALID_ROW_CENTS","rows["+i+"]");
  if(text(row.name).length>34)warn("LONG_COST_NAME","rows["+i+"].name");
 }
 const costTotal=goodRows.reduce((sum,r)=>sum+(cents(r?.shareCents)?r.shareCents:0),0);
 const prepaymentTotal=goodRows.reduce((sum,r)=>sum+(cents(r?.prepaymentCents)?r.prepaymentCents:0),0);
 if(settlement&&cents(settlement.costShareCents)&&costTotal!==settlement.costShareCents)
  err("LETTER_COST_MISMATCH","rows");
 if(settlement&&cents(settlement.prepaymentsCents)&&prepaymentTotal!==settlement.prepaymentsCents)
  err("LETTER_PREPAYMENT_MISMATCH","rows");
 if(tenant&&text(tenant.name).length>34)warn("LONG_RECIPIENT_NAME","tenant.name");
 if(tenant&&[tenant.street,tenant.postalCode+" "+tenant.city].some(x=>text(x).length>42))
  warn("LONG_ADDRESS","tenant.street");
 const signedBalanceCents=settlement&&["costShareCents","prepaymentsCents","correctionCents"].every(k=>cents(settlement[k]))?
   settlement.prepaymentsCents+settlement.correctionCents-settlement.costShareCents:null;
 const saldo=signedBalanceCents===null?null:{
  signedBalanceCents,
  type:signedBalanceCents===0?"Ausgeglichen":signedBalanceCents<0?"Nachzahlung":"Guthaben",
  amountCents:Math.abs(signedBalanceCents)
 };
 const signature=fingerprint({period,tenant,settings,rows,settlement});
 const dataReady=errors.length===0;
 const dataReviewed=dataReady&&reviewedSignature===signature;
 return{
  stage:"data-preflight-only",errors,warnings,saldo,costTotal,prepaymentTotal,
  signature,dataReady,dataReviewed,
  readyForPrint:false, // Always false until actual A4 HTML renderer/preflight is migrated & verified
  readyForRealFinalization:false,
  missing:["A4 rendering and browser/PDF parity","all tenant letters",
    "full V99.4.86 quality checks","immutable archive"]
 };
}
function prepareAll(input){
 if(!input||input.fixtureKind!=="synthetic"||!Array.isArray(input.letters))
  throw new TypeError("Synthetic-only letter bundle required");
 const reports=input.letters.map(letter=>prepare({...letter,fixtureKind:"synthetic"}));
 const missingRecipients=input.expectedTenantIds
   ?.filter(id=>!input.letters.some(letter=>letter.tenant?.id===id))||[];
 return{
  reports,expected:input.expectedTenantIds?.length??null,
  produced:input.letters.length,missingRecipients,
  dataReady:missingRecipients.length===0&&reports.length>0&&reports.every(r=>r.dataReady),
  readyForPrint:false,readyForRealFinalization:false
 };
}
module.exports=Object.freeze({prepare,prepareAll,fingerprint,version:"synthetic-letter-preflight-1"});
