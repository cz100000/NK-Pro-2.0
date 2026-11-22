/* NK-Pro 2.0 · Synthetic-only stage 3 workflow contract.
 * Source: legacy V99.4.86 default-seed.js cost names and identifiers.
 * No transfer of real names, invoices, or addresses on shared GitHub Pages.
 */
(function(root,factory){
 "use strict";const api=Object.freeze(factory());
 if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.NKPRO2_WORKFLOW=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const catalog=Object.freeze([["K001","Grundsteuer","Betriebskosten"],["K002","Wasserversorgung","Wasser"],["K003","Entwässerung","Betriebskosten"],["K004","Heizkosten","Betriebskosten"],["K005","Warmwasserversorgung","Betriebskosten"],["K006","Heiz- und Warmwasserkosten","Heizung"],["K007","Aufzug","Betriebskosten"],["K008","Straßenreinigung","Betriebskosten"],["K009","Müllbeseitigung","Abfall"],["K010","Gebäudereinigung","Betriebskosten"],["K011","Ungezieferbekämpfung","Betriebskosten"],["K012","Gartenpflege","Betriebskosten"],["K013","Beleuchtung / Allgemeinstrom","Betriebskosten"],["K014","Schornsteinreinigung","Betriebskosten"],["K015","Sach- und Haftpflichtversicherung","Betriebskosten"],["K016","Hauswart / Hausmeister","Betriebskosten"],["K017","Gemeinschaftsantenne / Verteilanlage","Betriebskosten – prüfen"],["K018","Wäschepflegeeinrichtungen","Betriebskosten"],["K019","Sonstige Betriebskosten","Betriebskosten – prüfen"],["K020","Verwaltungskosten","Eigentümerkosten"],["K021","Instandhaltung","Eigentümerkosten"],["K022","Instandsetzung / Reparaturen","Eigentümerkosten"],["K023","Bank- und Kontoführungsgebühren","Eigentümerkosten"],["K024","Rechts- und Steuerberatung","Eigentümerkosten"],["K025","Finanzierungskosten / Zinsen","Eigentümerkosten"],["K026","Leerstand / Mietausfall","Eigentümerkosten"],["K027","Modernisierung","Eigentümerkosten"],["K028","Anschaffung / Ersatzbeschaffung","Eigentümerkosten"],["K029","Eigene Verwaltungsarbeit","Eigentümerkosten"],["K030","Sonstige Eigentümerkosten","Eigentümerkosten"],["K031","Weitere Kosten 1","noch festlegen"],["K032","Weitere Kosten 2","noch festlegen"],["K033","Weitere Kosten 3","noch festlegen"],["K034","Weitere Kosten 4","noch festlegen"],["K035","Weitere Kosten 5","noch festlegen"]].map(([id,name,category])=>Object.freeze({id,name,category,
   ownerOnly:category==="Eigentümerkosten",placeholder:category==="noch festlegen"})));
 const clone=x=>JSON.parse(JSON.stringify(x));
 const date=s=>{if(typeof s!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
   const x=new Date(s+"T00:00:00Z");return !Number.isNaN(x.valueOf())&&x.toISOString().slice(0,10)===s};
 const money=n=>n!==null&&n!==undefined&&n!==""&&typeof n!=="boolean"&&
   Number.isFinite(Number(n))&&Number(n)>=0&&Math.abs(Number(n)*100-Math.round(Number(n)*100))<1e-7;
 const round=n=>Math.round((n+Number.EPSILON)*100)/100;
 function guard(state){
   if(!state||state.fixture!==true||state.period!=="2025"||
     !Array.isArray(state.tenancies)||!Array.isArray(state.costs))
     throw new TypeError("Synthetic 2025 fixture required; no real datasets");
 }
 function splitName(name){
   const pieces=String(name||"").trim().split(/\s+/);
   return{firstName:pieces.slice(0,-1).join(" "),lastName:pieces.at(-1)||""};
 }
 function defaultPayment(t){
   return {mode:"annual",agreedMonthly:null,agreedAnnual:null,paidActual:money(t.advance)?Number(t.advance):0};
 }
 function upgrade(state){
   guard(state);
   const result=clone(state);
   result.tenancies=result.tenancies.map(t=>{
     const split=splitName(t.name);
     return {...t,firstName:t.firstName??split.firstName,lastName:t.lastName??split.lastName,
       salutation:t.salutation||"neutral",recipientStreet:t.recipientStreet||"",
       recipientPostalCode:t.recipientPostalCode||"",recipientCity:t.recipientCity||""};
   });
   const payments=result.payments||{};
   result.payments=Object.fromEntries(result.tenancies.map(t=>[t.id,
     {...defaultPayment(t),...(payments[t.id]||{})}]));
   result.costs=result.costs.map(c=>({...c,sourceId:c.sourceId||"",active:c.active!==false,
     invoiceDate:c.invoiceDate||"",documentDate:c.documentDate||"",invoiceNumber:c.invoiceNumber||"",
     issuer:c.issuer||"",invoiceReference:c.invoiceReference||"",note:c.note||""}));
   result.settlement={year:"2025",status:"draft",revision:0,...(result.settlement||{})};
   result.externalValues=result.externalValues&&typeof result.externalValues==="object"?result.externalValues:{};
   result.letterSettings={senderName:"",senderStreet:"",senderCity:"",letterDate:"",
      paymentDue:"",bankAccount:"",openingText:"für den Abrechnungszeitraum {zeitraum} erhalten Sie folgende Übersicht:",
      closingText:"Bei Fragen stehe ich Ihnen gerne zur Verfügung.",
      signature:"",annexText:"Heiz- und Warmwasserkostenabrechnung des Messdienstleisters",
      ...result.letterSettings};
   return result;
 }
 function example(state){
   let x=upgrade(state);
   const heat=x.costs.find(c=>c.id==="heat");
   if(heat&&x.tenancies.length===7){
     heat.method="Externe Einzelabrechnung";
     heat.sourceId="K006";
     const available=Math.round((Number(heat.amount)-Number(heat.landlordShare??0))*100);
     const weights=x.tenancies.map(t=>Number(x.units.find(u=>u.id===t.unitId)?.area||0));
     const sum=weights.reduce((s,w)=>s+w,0);
     let used=0;
     const rows={};
     x.tenancies.forEach((t,i)=>{const amount=i===x.tenancies.length-1?
       available-used:Math.round(available*weights[i]/sum);
       used+=amount;rows[t.id]={amount:amount/100,units:null,note:"SYNTHETISCHE Beispielwerte – kein Techem-Beleg"};});
     x.externalValues.heat={rows,source:"SYNTHETISCHES Techem-Muster",confirmed:false};
     heat.note="Fiktiver Datensatz: keine tatsächliche Techem-Einzelabrechnung.";
   }
   return x;
 }
 function days(a,b){return Math.round((Date.parse(b+"T00:00:00Z")-Date.parse(a+"T00:00:00Z"))/86400000)+1}
 function expectedMonthly(start,end,monthly){
   if(!date(start)||!date(end)||start>end||!money(monthly))throw new RangeError("Invalid monthly advance period");
   let total=0,ym=start.slice(0,7);
   while(ym<=end.slice(0,7)){
     const monthStart=ym+"-01",y=Number(ym.slice(0,4)),m=Number(ym.slice(5,7));
     const next=new Date(Date.UTC(y,m,1)).toISOString().slice(0,10);
     const monthEnd=new Date(Date.UTC(y,m,0)).toISOString().slice(0,10);
     const lower=start>monthStart?start:monthStart,upper=end<monthEnd?end:monthEnd;
     if(lower<=upper)total+=Number(monthly)*days(lower,upper)/days(monthStart,monthEnd);
     ym=next.slice(0,7);
   }
   return round(total);
 }
 function expected(t,p){
   if(p?.mode==="monthly"&&money(p.agreedMonthly))return expectedMonthly(t.start,t.end,p.agreedMonthly);
   if(p?.mode==="annual"&&money(p.agreedAnnual))return Number(p.agreedAnnual);
   return null;
 }
 function setPayment(state,id,{mode,agreed,paid}){
   const x=upgrade(state),t=x.tenancies.find(t=>t.id===id);
   if(!t||!["monthly","annual"].includes(mode)||!money(agreed)||!money(paid))
     throw new RangeError("Invalid synthetic payment values");
   x.payments[id]={mode,agreedMonthly:mode==="monthly"?Number(agreed):null,
     agreedAnnual:mode==="annual"?Number(agreed):null,paidActual:Number(paid)};
   // Tenant identity, usage role and dates stay unmodified.
   return x;
 }
 function renameTenant(state,id,props){
   const x=upgrade(state),t=x.tenancies.find(t=>t.id===id);
   if(!t)throw new RangeError("Unknown synthetic tenancy");
   const first=String(props.firstName||"").trim(),last=String(props.lastName||"").trim();
   if(!last||!["neutral","Herr","Frau","individuell"].includes(props.salutation))
     throw new RangeError("Invalid name or correspondence salutation");
   Object.assign(t,{firstName:first,lastName:last,name:[first,last].filter(Boolean).join(" "),
     salutation:props.salutation,customSalutation:String(props.customSalutation||"").slice(0,160),
     recipientStreet:String(props.recipientStreet||"").slice(0,120),
     recipientPostalCode:String(props.recipientPostalCode||"").slice(0,12),
     recipientCity:String(props.recipientCity||"").slice(0,80)});
   return x;
 }
 function setInvoice(state,id,fields){
   const x=upgrade(state),c=x.costs.find(v=>v.id===id);
   if(!c)throw new RangeError("Unknown cost");
   for(const key of ["invoiceDate","documentDate"])
     if(fields[key]&& !date(fields[key]))throw new RangeError("Invalid invoice or document date");
   for(const key of ["invoiceDate","documentDate","invoiceNumber","issuer","invoiceReference"])
     c[key]=String(fields[key]||"").slice(0,200);
   return x;
 }
 function deactivate(state,id){
   const x=upgrade(state),c=x.costs.find(v=>v.id===id);
   if(!c)throw new RangeError("Unknown cost");
   c.active=false;return x;
 }
 function removeUnused(state,id){
   const x=upgrade(state),c=x.costs.find(v=>v.id===id);
   if(!c||!String(id).startsWith("SYN-K-")||
     x.settlement.status!=="draft"||x.externalValues[id]||c.usedInArchive)
     throw new RangeError("Only draft, unarchived synthetic custom costs without external individual values may be deleted");
   x.costs=x.costs.filter(v=>v.id!==id);return x;
 }
 function setExternal(state,costId,caseId,amount,units,note){
   const x=upgrade(state),c=x.costs.find(v=>v.id===costId);
   if(!c||!x.tenancies.some(t=>t.id===caseId)||!money(amount)||
     (units!==null&&units!==""&&(!Number.isFinite(Number(units))||Number(units)<0)))
     throw new RangeError("Invalid external individual cost");
   const current=x.externalValues[costId]||{rows:{},source:"Externe Einzelabrechnung",confirmed:false};
   current.rows[caseId]={amount:Number(amount),units:units===""?null:units===null?null:Number(units),
     note:String(note||"").slice(0,2000)};
   current.confirmed=false;x.externalValues[costId]=current;
   return x;
 }
 function invoiceCatalog(id){return catalog.find(x=>x.id===id)||null}
 return {catalog,guard,upgrade,example,splitName,expectedMonthly,expected,setPayment,
   renameTenant,setInvoice,deactivate,removeUnused,setExternal,invoiceCatalog,
   version:"synthetic-stage-3-workflow-1"};
});