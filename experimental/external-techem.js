/* NK-Pro 2.0 experimental external individual settlements.
   Strictly isolated from the live UX demo and every production-data store.
   Parity target: selected V99.4.86 'Externe Einzelabrechnung' paths, synthetic fixtures only. */
(function(root,factory){
"use strict";
const api=Object.freeze(factory());
if(typeof module!=="undefined"&&module.exports)module.exports=api;
else root.NKPRO2_EXPERIMENTAL_EXTERNAL=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const hasNum=v=>v!==null&&v!==undefined&&v!==""&&Number.isFinite(Number(v));
function iso(v){const s=String(v||"").slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(s)?s:""}
function addDay(s,d){if(!iso(s))return"";const value=new Date(s+"T12:00:00Z");value.setUTCDate(value.getUTCDate()+d);return value.toISOString().slice(0,10)}
function overlap(a,b,c,d){const start=[iso(a),iso(c)].filter(Boolean).sort().at(-1)||"",end=[iso(b),iso(d)].filter(Boolean).sort().at(0)||"";return start&&end&&start<=end?{start,end}:null}
function deriveCases(input){
 const {period,units,tenants}=input||{};
 if(!period||!iso(period.start)||!iso(period.end)||period.start>period.end)throw new TypeError("Explicit valid period needed");
 if(!Array.isArray(units)||!Array.isArray(tenants))throw new TypeError("Unit and tenancy arrays required");
 const unitMap=new Map(units.filter(u=>u&&u.id).map(u=>[String(u.id),u]));
 for(const tenant of tenants)if(tenant&&tenant.unitId&&!unitMap.has(String(tenant.unitId)))unitMap.set(String(tenant.unitId),{id:tenant.unitId});
 const result=[];
 for(const unit of unitMap.values()){
  const unitId=String(unit.id);
  const rows=tenants.map((tenant,index)=>{
   if(!tenant||String(tenant.unitId)!==unitId)return null;
   const dates=overlap(tenant.start||period.start,tenant.end||period.end,period.start,period.end);
   return dates?{tenant,index,...dates}:null;
  }).filter(Boolean).sort((a,b)=>a.start.localeCompare(b.start)||a.end.localeCompare(b.end));
  for(const row of rows){
   const role=row.tenant.private?"private":"tenant",tenantId=String(row.tenant.id||("ROW-"+row.index));
   result.push({caseKey:[role,tenantId,unitId,row.start,row.end].join(":"),
     role,unitId,tenantId:String(row.tenant.id||""),start:row.start,end:row.end,originalIndex:row.index});
  }
  let cursor=period.start;
  for(const row of rows){
   if(cursor<row.start){
    const end=addDay(row.start,-1);
    if(end&&cursor<=end)result.push({caseKey:["vacancy",unitId,cursor,end].join(":"),
      role:"vacancy",unitId,tenantId:"",start:cursor,end,originalIndex:-1});
   }
   if(cursor<=row.end)cursor=addDay(row.end,1);
  }
  if(cursor&&cursor<=period.end)result.push({caseKey:["vacancy",unitId,cursor,period.end].join(":"),
    role:"vacancy",unitId,tenantId:"",start:cursor,end:period.end,originalIndex:-1});
 }
 return result.sort((a,b)=>a.unitId.localeCompare(b.unitId,"de",{numeric:true})||a.start.localeCompare(b.start)||a.role.localeCompare(b.role));
}
function calculateExternal(input){
 const {cost,tenants,values={},externalOwnerShare=0}=input||{};
 if(!cost||!hasNum(cost.amount)||num(cost.amount)<0||!Array.isArray(tenants)||!hasNum(externalOwnerShare)||num(externalOwnerShare)<0)
  throw new TypeError("Invalid synthetic provider settlement input");
 const cases=deriveCases(input);
 const owners=(cost.exclusionMode==="owner"),excluded=new Set(cost.excludedTenantIds||[]);
 const basis=owners?tenants:tenants.filter(t=>!excluded.has(t.id));
 const allocations=Object.fromEntries(tenants.map(t=>[t.id,0]));
 const issues=[],has=(key)=>Object.prototype.hasOwnProperty.call(values,key);
 for(const c of cases){
  if(!has(c.caseKey)||!hasNum(values[c.caseKey]))issues.push({code:"OPEN_CASE",caseKey:c.caseKey,unitId:c.unitId});
  else if(num(values[c.caseKey])<0)issues.push({code:"NEGATIVE_CASE",caseKey:c.caseKey,unitId:c.unitId});
 }
 let inputSum=0;
 for(const tenant of basis){
  const amounts=cases.filter(c=>c.originalIndex===tenants.indexOf(tenant));
  // Mirror the original individualCaseValue fallback: missing case values count as zero.
  const amount=amounts.reduce((sum,c)=>sum+num(values[c.caseKey]),0);
  allocations[tenant.id]=amount;
  inputSum+=amount;
 }
 const vacancyShare=cases.filter(c=>c.role==="vacancy").reduce((sum,c)=>sum+num(values[c.caseKey]),0);
 inputSum+=vacancyShare;
 let ownerShare=num(cost.amount)-basis.reduce((sum,t)=>sum+num(allocations[t.id]),0);
 if(owners)for(const t of tenants)if(excluded.has(t.id)){
   ownerShare+=allocations[t.id];allocations[t.id]=0;
 }
 const documentedOwnerShare=vacancyShare+num(externalOwnerShare);
 const excludedOwnerShare=owners?tenants.filter(t=>excluded.has(t.id)).reduce((sum,t)=>sum+cases.filter(c=>c.tenantId===t.id).reduce((acc,c)=>acc+num(values[c.caseKey]),0),0):0;
 const unclassifiedOwnerShare=ownerShare-documentedOwnerShare-excludedOwnerShare;
 const totalCaptured=Object.values(allocations).reduce((sum,x)=>sum+x,0)+documentedOwnerShare+excludedOwnerShare;
 if(Math.abs(totalCaptured-num(cost.amount))>.01)issues.push({code:"PROVIDER_MISMATCH",difference:totalCaptured-num(cost.amount)});
 if(Math.abs(unclassifiedOwnerShare)>.01)issues.push({code:"UNCLASSIFIED_OWNER_BALANCE",amount:unclassifiedOwnerShare});
 if(tenants.length!==new Set(tenants.map(t=>t.id)).size)issues.push({code:"DUPLICATE_TENANT"});
 const status=Math.abs(ownerShare)<=.01?"Vollständig":ownerShare>0?"Nicht auf Mieter umgelegt":"Überverteilung prüfen";
 return{allocations,ownerShare,basisTotal:inputSum,inputSum,status,vacancyShare,
   externalOwnerShare:num(externalOwnerShare),documentedOwnerShare,caseValuesUsed:true,
   cases,excludedOwnerShare,unclassifiedOwnerShare,issues,readyForDemoReview:issues.length===0};
}
return{deriveCases,calculateExternal,version:"external-reference-experimental-1"};
});
