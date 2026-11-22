/* NK-Pro 0.7: synthetic multi-object portfolio; no genuine records allowed. */
(function(root,factory){"use strict";const api=Object.freeze(factory());if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.NKPRO2_ESTATES=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){"use strict";
 const SCHEMA="nkpro2-estates-synthetic-v1",copy=x=>JSON.parse(JSON.stringify(x));
 const date=s=>{if(typeof s!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+"T00:00:00Z");return !Number.isNaN(d.valueOf())&&d.toISOString().slice(0,10)===s};
 const days=(a,b)=>(Date.parse(b+"T00:00:00Z")-Date.parse(a+"T00:00:00Z"))/86400000+1;
 const yr=y=>["2023","2024","2025"].includes(String(y)),pad=n=>String(n).padStart(2,"0");
 const names=[["Mara","Sommer"],["Felix","Neumann"],["Nora","Winter"],["Paul","Fischer"],["Lina","Berger"],["Jonas","Schulz"],["Ella","Krüger"],["Lea","Hoffmann"],["Tim","Wagner"],["Mila","Braun"],["Leon","Weber"],["Mia","Roth"],["Anna","Keller"]];
 const positions=["EG links","EG rechts","1. OG links","1. OG rechts","2. OG links","2. OG rechts","Dachgeschoss"];
 const configurations=[["SYN-A","Musterobjekt A","Beispielstraße 17","00001","Musterstadt",7],
 ["SYN-B","Musterobjekt B","Demoweg 8","00002","Beispieldorf",3],
 ["SYN-C","Musterobjekt C","Testgasse 3","00003","Musterhausen",2]];
 const statusLabel=s=>s==="draft"?"In Bearbeitung":s==="historical-sample"?"Historischer Musterstand · Nur Ansicht":
   s==="closed"?"Abgeschlossen · Nur Ansicht":s==="archived"?"Archiviert · Nur Ansicht":"Status prüfen";
 function masterFor(row,old){
   const [id,name,street,postalCode,city,n]=row,L=id.slice(-1);
   const units=Array.from({length:n},(_,i)=>{
     const u=id==="SYN-A"?old?.units?.[i]:null;
     return{id:u?.id||"SYN-"+L+"-W"+pad(i+1),label:u?.label||"Wohnung "+(i+1),
       position:u?.position||positions[i],area:Number(u?.area||[62,78,71,69,82,74,65][i]),
       active:true,meters:{cold:"DEMO-"+L+"-KW-"+pad(i+1),hot:"DEMO-"+L+"-WW-"+pad(i+1)}};
   });
   const tenancies=units.map((u,i)=>{
     const prev=id==="SYN-A"?old?.tenancies?.find(t=>t.unitId===u.id):null;
     const [a,b]=names[(i+(L==="B"?7:L==="C"?10:0))%names.length];
     return{id:prev?.id||"SYN-"+L+"-T"+pad(i+1),unitId:u.id,name:prev?.name||a+" "+b,
       firstName:prev?.firstName||a,lastName:prev?.lastName||b,
       role:prev?.role||((L==="C"&&i===1)?"Privatanteil":"Mieter"),persons:Number(prev?.persons||i%3+1),
       leaseStart:"2022-01-01",leaseEnd:null,salutation:prev?.salutation||"neutral",
       customSalutation:"",postalOverride:null,note:"Synthetisches Mietverhältnis."};
   });
   if(id==="SYN-B"){
     tenancies[1].leaseEnd="2024-06-30";
     tenancies.push({id:"SYN-B-T04",unitId:units[1].id,name:"Lea Hoffmann",firstName:"Lea",lastName:"Hoffmann",
       role:"Mieter",persons:2,leaseStart:"2024-07-15",leaseEnd:null,salutation:"neutral",
       customSalutation:"",postalOverride:null,note:"Muster-Mieterwechsel, Leerstand 01.–14.07.2024."});
   }
   return{id,name,street,postalCode,city,revision:1,units,tenancies,settlements:{}};
 }
 function project(master,year){
   if(!yr(year))throw new RangeError("Unbekanntes Musterjahr");
   const from=year+"-01-01",to=year+"-12-31";
   return master.tenancies.filter(t=>date(t.leaseStart)&&(!t.leaseEnd||date(t.leaseEnd))&&
     t.leaseStart<=to&&(!t.leaseEnd||t.leaseEnd>=from)).map(t=>{
     const addr=t.postalOverride||master;
     return{id:t.id,sourceTenancyId:t.id,unitId:t.unitId,name:t.name,
       firstName:t.firstName,lastName:t.lastName,role:t.role,persons:t.persons,
       start:t.leaseStart>from?t.leaseStart:from,end:t.leaseEnd&&t.leaseEnd<to?t.leaseEnd:to,
       leaseStart:t.leaseStart,leaseEnd:t.leaseEnd,advance:0,consumptionCold:null,consumptionHot:null,
       salutation:t.salutation,customSalutation:t.customSalutation,
       recipientStreet:addr.street,recipientPostalCode:addr.postalCode,recipientCity:addr.city,
       note:t.note||""};
   }).sort((a,b)=>a.unitId.localeCompare(b.unitId)||a.start.localeCompare(b.start));
 }
 function syntheticYear(master,year){
   const cases=project(master,year),letter=master.id.slice(-1);
   const units=master.units.map((u,i)=>{
     const startCold=120+i*43+(Number(year)-2023)*35,startHot=230+i*29+(Number(year)-2023)*17;
     const volCold=22+i*3,volHot=9+i*2;
     return{...copy(u),advance:0,waterStart:startCold,waterEnd:startCold+volCold+volHot,
       waterMeters:{cold:{number:u.meters.cold,start:startCold,end:startCold+volCold,startDate:year+"-01-01",endDate:year+"-12-31",interimReadings:[]},
       hot:{number:u.meters.hot,start:startHot,end:startHot+volHot,startDate:year+"-01-01",endDate:year+"-12-31",interimReadings:[]}},
       waterNote:"Synthetische Jahresablesung."};
   });
   const waterVolume=units.reduce((s,u)=>s+u.waterMeters.cold.end-u.waterMeters.cold.start+
     u.waterMeters.hot.end-u.waterMeters.hot.start,0);
   const costs=[{id:"water",sourceId:"K002",name:"Wasser & Abwasser",category:"Wasser",
     amount:Number((waterVolume*(5.2+(Number(year)-2023)*.19)).toFixed(2)),method:"Verbrauch",landlordShare:0,active:true,note:"Fiktive Rechnung"},
     {id:"waste",sourceId:"K009",name:"Müllbeseitigung",category:"Abfall",
     amount:300+units.length*125+(Number(year)-2023)*24,method:"Fläche",landlordShare:0,active:true,note:"Fiktive Rechnung"},
     {id:"heat",sourceId:"K006",name:"Heizung / Warmwasser",category:"Heizung",
     amount:1200+units.length*720+(Number(year)-2023)*170+.88,method:"Externe Einzelabrechnung",
     landlordShare:0.88,active:true,note:"Fiktive Techem-Einzelabrechnung"}];
   const a={fixture:true,period:year,property:{id:master.id,name:master.name,street:master.street,
       postalCode:master.postalCode,city:master.city,buildingId:master.id+"-G1"},
     units,tenancies:cases,costs,houseWater:waterVolume,
     waterSettings:{houseMeterNumber:"DEMO-"+letter+"-HAUS-"+year,
       houseStart:800+(Number(year)-2023)*360,houseEnd:800+(Number(year)-2023)*360+waterVolume,
       houseStartDate:year+"-01-01",houseEndDate:year+"-12-31",invoiceNote:"Fiktiver Beleg"},
     payments:{},externalValues:{},waterDecision:null,demoFinalized:false,
     settlement:{year,status:"historical-sample",masterRevision:master.revision,revision:1,
       createdFrom:"synthetic-master",readOnly:true},
     letterSettings:{senderName:"Demo-Verwaltung",senderStreet:"Beispielweg 1",
       senderCity:"00000 Musterstadt",letterDate:year+"-12-31",paymentDue:year+"-12-31",
       signature:"Demo",openingText:"für den Abrechnungszeitraum {zeitraum} erhalten Sie folgende Musterabrechnung.",
       closingText:"Unverbindliche Musterdaten – nicht versenden.",annexText:"Synthetische Techem-Einzelwerte",
       subject:"Nebenkostenabrechnung "+year}};
   for(const c of cases){
     const paid=Math.round(180*days(c.start,c.end)/365*100)/100;
     c.advance=paid;a.payments[c.id]={mode:"annual",agreedAnnual:paid,agreedMonthly:null,paidActual:paid};
   }
   if(master.id==="SYN-B"&&year==="2024"){
     const unit=units[1],rows=cases.filter(t=>t.unitId===unit.id).sort((x,y)=>x.start.localeCompare(y.start));
     if(rows.length!==2)throw new Error("Invalid B 2024 synthetic gap fixture");
     for(const [kind,oldQty,vacantQty] of [["cold",8,2],["hot",6,1]]){
       const m=unit.waterMeters[kind];
       m.interimReadings=[{date:"2024-06-30",value:m.start+oldQty},
         {date:"2024-07-15",value:m.start+oldQty+vacantQty}];
       rows[0][kind==="cold"?"consumptionCold":"consumptionHot"]=oldQty;
       rows[1][kind==="cold"?"consumptionCold":"consumptionHot"]=m.end-m.start-oldQty-vacantQty;
     }
   }
   const allocable=Math.round((costs[2].amount-costs[2].landlordShare)*100);
   const personDays=cases.reduce((s,c)=>s+c.persons*days(c.start,c.end),0);
   let used=0;const externalRows={};
   cases.forEach((c,i)=>{
     const share=i===cases.length-1?allocable-used:
       Math.round(allocable*c.persons*days(c.start,c.end)/personDays);
     used+=share;externalRows[c.id]={amount:share/100,units:15+i*3,note:"Synthetische Einzelkosten"};
   });
   a.externalValues.heat={rows:externalRows,source:"SYNTHETISCHE EINZELWERTE",confirmed:false};
   return a;
 }
 function create(existing){
   if(existing?.fixture!==true||existing.period!=="2025"||existing.units?.length!==7)
     throw new TypeError("A synthetische 2025-Sieben-Wohnungen-Demo is required");
   const objects=configurations.map(c=>masterFor(c,existing));
   for(const o of objects)for(const y of ["2023","2024"])o.settlements[y]=syntheticYear(o,y);
   const a=objects[0],old=copy(existing);
   old.property={...old.property,id:a.id,name:a.name,street:a.street,postalCode:a.postalCode,
     city:a.city,buildingId:a.id+"-G1"};
   old.settlement={...old.settlement,year:"2025",status:"draft",
     masterRevision:a.revision,revision:1,createdFrom:"existing-0.6-demo"};
   old.tenancies=project(a,"2025").map(t=>{
     const original=old.tenancies.find(x=>x.id===t.id);
     return{...t,advance:original?.advance??0,
       consumptionCold:original?.consumptionCold??null,
       consumptionHot:original?.consumptionHot??null};
   });
   a.settlements["2025"]=old;
   return{schema:SCHEMA,fixture:true,version:1,selectedObjectId:a.id,selectedYear:"2025",objects};
 }
 function validate(p){
   if(p?.schema!==SCHEMA||p.fixture!==true||!Array.isArray(p.objects)||p.objects.length<1)
     throw new TypeError("Only synthetic NK-Pro 0.7 portfolios are allowed");
   const ids=new Set();
   for(const o of p.objects){
     if(!o?.id||ids.has(o.id)||!Array.isArray(o.units)||!Array.isArray(o.tenancies)||!o.settlements)
       throw new TypeError("Incomplete or duplicate property master");
     ids.add(o.id);
     const unitIds=new Set(o.units.map(u=>u.id));
     if(unitIds.size!==o.units.length||o.tenancies.some(t=>!unitIds.has(t.unitId)))
       throw new TypeError("Invalid apartment / tenancy relationship");
     for(const [year,a] of Object.entries(o.settlements))
       if(!yr(year)||a?.fixture!==true||a.period!==year||
         !Array.isArray(a.units)||!Array.isArray(a.tenancies))
         throw new TypeError("Invalid synthetic annual record");
   }
   if(!ids.has(p.selectedObjectId)||!p.objects.find(o=>o.id===p.selectedObjectId).settlements[p.selectedYear])
      throw new TypeError("Selected context missing");
   return p;
 }
 const object=(p,id)=>validate(p).objects.find(x=>x.id===(id||p.selectedObjectId));
 const annual=(p,id,year)=>object(p,id)?.settlements[String(year)]||null;
 const current=p=>annual(p,p.selectedObjectId,p.selectedYear);
 const readonly=a=>!a||a.settlement?.status!=="draft";
 function selectObject(input,id){
   const p=copy(validate(input)),o=p.objects.find(x=>x.id===id);
   if(!o)throw new RangeError("Unknown property");
   p.selectedObjectId=id;p.selectedYear=o.settlements["2025"]?"2025":Object.keys(o.settlements).sort().at(-1);
   return p;
 }
 function selectYear(input,id,year){
   const p=copy(validate(input)),o=p.objects.find(x=>x.id===id);
   if(!o?.settlements[String(year)])throw new RangeError("Unknown object/year");
   p.selectedObjectId=id;p.selectedYear=String(year);return p;
 }
 function editMaster(input,id,kind,entry){
   const p=copy(validate(input)),o=p.objects.find(x=>x.id===id);
   if(!o)throw new RangeError("Unknown object");
   if(kind==="property"){
     if(!String(entry.name||"").trim())throw new TypeError("Object name required");
     for(const k of ["name","street","postalCode","city"])o[k]=String(entry[k]||"").trim().slice(0,160);
   }else if(kind==="unit"){
     const u=o.units.find(x=>x.id===entry.id);
     if(!u||!(Number(entry.area)>0))throw new TypeError("Apartment and area required");
     Object.assign(u,{label:String(entry.label||"").trim(),position:String(entry.position||"").trim(),area:Number(entry.area)});
   }else if(kind==="tenancy"){
     if(!o.units.some(u=>u.id===entry.unitId)||!date(entry.leaseStart)||
       (entry.leaseEnd&&!date(entry.leaseEnd))||
       (entry.leaseEnd&&entry.leaseEnd<entry.leaseStart)||!String(entry.lastName||"").trim()||
       !["Mieter","Privatanteil","Eigennutzung"].includes(entry.role)||
       !Number.isSafeInteger(Number(entry.persons))||Number(entry.persons)<0)
         throw new TypeError("Invalid permanent tenancy");
     const index=o.tenancies.findIndex(t=>t.id===entry.id);
     const next={...(index<0?{}:o.tenancies[index]),...copy(entry),
       leaseEnd:entry.leaseEnd||null,persons:Number(entry.persons),
       name:[entry.firstName,entry.lastName].filter(Boolean).join(" ")};
     if(index<0)o.tenancies.push(next);else o.tenancies[index]=next;
     if(o.tenancies.some(t=>t.id!==next.id&&t.unitId===next.unitId&&
        t.leaseStart<=(next.leaseEnd||"9999-12-31")&&next.leaseStart<=(t.leaseEnd||"9999-12-31")))
       throw new RangeError("Overlapping permanent tenancies");
   }else throw new RangeError("Unknown master editing type");
   o.revision=(Number(o.revision)||0)+1;return validate(p);
 }
 function rebasePreview(p,id,year){
   const o=object(p,id),a=annual(p,id,year);
   if(!o||!a)throw new RangeError("Unknown annual");
   const newer=project(o,String(year)),before=new Set(a.tenancies.map(t=>t.id)),
     after=new Set(newer.map(t=>t.id));
   const added=newer.filter(t=>!before.has(t.id)).map(t=>t.id),
     removed=a.tenancies.filter(t=>!after.has(t.id)).map(t=>t.id);
   const conflicts=removed.filter(id=>Number(a.payments?.[id]?.paidActual||0)!==0||
     Object.values(a.externalValues||{}).some(v=>Object.prototype.hasOwnProperty.call(v?.rows||{},id)));
   return{objectId:id,year:String(year),fromRevision:a.settlement?.masterRevision||0,
     toRevision:o.revision,stale:o.revision!==(a.settlement?.masterRevision||0),
     added,removed,conflicts};
 }
 function rebaseDraft(input,id,year){
   const diff=rebasePreview(input,id,year),p=copy(validate(input)),
     o=p.objects.find(x=>x.id===id),a=o.settlements[year];
   if(readonly(a))throw new RangeError("Historical annual contexts are read-only");
   if(diff.conflicts.length||diff.removed.length)throw new RangeError("Annual case deletion needs manual resolution");
   a.tenancies=project(o,year).map(t=>{
     const old=a.tenancies.find(x=>x.id===t.id);
     return{...t,advance:old?.advance??0,consumptionCold:old?.consumptionCold??null,
       consumptionHot:old?.consumptionHot??null};
   });
   a.units=o.units.map(u=>{
     const old=a.units.find(v=>v.id===u.id);
     if(!old)throw new RangeError("New apartment needs a meter migration");
     return{...old,label:u.label,position:u.position,area:u.area};
   });
   a.property={id:o.id,name:o.name,street:o.street,postalCode:o.postalCode,city:o.city,buildingId:o.id+"-G1"};
   a.settlement={...a.settlement,masterRevision:o.revision,revision:(a.settlement.revision||0)+1};
   for(const t of a.tenancies)if(!a.payments?.[t.id])a.payments[t.id]={mode:"annual",agreedAnnual:null,agreedMonthly:null,paidActual:0};
   a.letterChecked=false;a.reviewInvalidated=true;a.demoFinalized=false;
   return validate(p);
 }
 return{SCHEMA,create,validate,object,annual,current,readonly,project,selectObject,selectYear,
  editMaster,rebasePreview,rebaseDraft,statusLabel,version:"synthetic-estates-v1"};
});