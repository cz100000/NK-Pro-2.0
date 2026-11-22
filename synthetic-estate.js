/* NK-Pro 0.7: synthetic multi-object portfolio; no genuine records allowed. */
(function(root,factory){"use strict";const api=Object.freeze(factory());if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.NKPRO2_ESTATES=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){"use strict";
 const SCHEMA="nkpro2-estates-synthetic-v1",copy=x=>JSON.parse(JSON.stringify(x));

 const METER_TYPES=Object.freeze({cold:"Kaltwasser",hot:"Warmwasser",
   electricity:"Strom",heat:"Techem-Heizkostenverteiler"});
 const meterStatus=Object.freeze({active:"Aktiv",placeholder:"Musterplatzhalter",retired:"Außer Betrieb"});
 const legacyMeterId=(unitId,suffix)=>"SYN-MTR-"+encodeURIComponent(unitId)+"-"+suffix;
 const sampleMeter=(u,type,id,number="",room="",radiator="")=>({
   id,unitId:u.id,type,number,room,radiator,status:number?"active":"placeholder",
   installedOn:null,removedOn:null,note:number?"Übernommener fiktiver Zählerstamm.":
     "Musterplatzhalter – keine bestätigte Zähleridentität."});
 function initialRegistry(o){
   return o.units.flatMap(u=>[
     sampleMeter(u,"cold",legacyMeterId(u.id,"KW"),u.meters?.cold||""),
     sampleMeter(u,"hot",legacyMeterId(u.id,"WW"),u.meters?.hot||""),
     sampleMeter(u,"electricity",legacyMeterId(u.id,"STROM")),
     sampleMeter(u,"heat",legacyMeterId(u.id,"HKV-WZ"),"","Wohnzimmer","Heizkörper 1"),
     sampleMeter(u,"heat",legacyMeterId(u.id,"HKV-SZ"),"","Schlafzimmer","Heizkörper 1")
   ]);
 }
 // Compatibility-only projection for 0.7 water billing. The registry is the editable master.
 // Retiring a water meter does not rewrite historical billing snapshots.
 function updateLegacyWaterAlias(o,unitId,type,number){
   if(type!=="cold"&&type!=="hot")return;
   const u=o.units.find(x=>x.id===unitId);
   if(u){u.meters=u.meters||{};u.meters[type]=number;}
 }
 function meterReferenced(o,m){
   if(!["cold","hot"].includes(m.type))return false;
   return Object.values(o.settlements).some(a=>(a.units||[]).some(u=>
     u.id===m.unitId&&(()=>{
       const v=u.waterMeters?.[m.type];
       if(!v)return false;
       return v.number===m.number||(v.segments||[]).some(seg=>seg.number===m.number);
     })()));
 }
 function assertMeterFields(o,fields,old){
   const type=fields?.type,unitId=fields?.unitId,status=fields?.status||"placeholder";
   const number=String(fields?.number||"").trim(),room=String(fields?.room||"").trim(),
     radiator=String(fields?.radiator||"").trim(),note=String(fields?.note||"").trim(),
     installedOn=fields?.installedOn||null,removedOn=fields?.removedOn||null;
   if(!o.units.some(u=>u.id===unitId)||!METER_TYPES[type]||!meterStatus[status])
     throw new TypeError("Zählertyp, Status oder Wohnung ungültig");
   if([number,room,radiator].some(v=>v.length>100)||note.length>1000)
     throw new TypeError("Zählerangaben zu lang");
   if((installedOn&&!date(installedOn))||(removedOn&&!date(removedOn))||
     (installedOn&&removedOn&&removedOn<installedOn))
     throw new TypeError("Einbau-/Ausbaudatum ist ungültig");
   if(status==="active"&&!number)throw new TypeError("Aktiver Zähler benötigt eine Zählernummer");
   if(status==="retired"&&!number)throw new TypeError("Für ausgebauten Zähler ist eine Nummer erforderlich");
   if(type==="heat"&&!room)throw new TypeError("Für Heizkostenverteiler bitte Raum angeben");
   if(old&&(type!==old.type||unitId!==old.unitId))
     throw new RangeError("Zählertyp und Wohnung sind an die stabile Zähler-ID gebunden");
   if(old&&old.number!==number&&meterReferenced(o,old))
     throw new RangeError("Zählernummer ist in Jahresständen referenziert. Alten Zähler außer Betrieb setzen und neuen anlegen.");
   if(status==="active"&&["cold","hot"].includes(type)&&
     o.meterRegistry.some(m=>m.id!==old?.id&&m.unitId===unitId&&m.type===type&&m.status==="active"))
     throw new RangeError("Für diese Wohnung ist bereits ein aktiver Wasserzähler dieses Typs vorhanden");
   if(number&&o.meterRegistry.some(m=>m.id!==old?.id&&m.number===number&&m.status!=="retired"))
     throw new RangeError("Zählernummer bereits in diesem Objekt vergeben");
   return{type,unitId,status,number,room,radiator,note,installedOn,removedOn};
 }
 function addMeter(input,objectId,fields){
   const p=upgradePortfolio(input),o=p.objects.find(x=>x.id===objectId);
   if(!o||o.lifecycle.status!=="active")throw new RangeError("Aktives Objekt fehlt");
   const row=assertMeterFields(o,fields,null),m={id:newId("SYN-MTR-"),...row};
   o.meterRegistry.push(m);
   if(m.status==="active")updateLegacyWaterAlias(o,m.unitId,m.type,m.number);
   o.revision++;touch(p,o);return validate(p);
 }
 function editMeter(input,objectId,meterId,fields){
   const p=upgradePortfolio(input),o=p.objects.find(x=>x.id===objectId);
   if(!o||o.lifecycle.status!=="active")throw new RangeError("Aktives Objekt fehlt");
   const index=o.meterRegistry.findIndex(x=>x.id===meterId);
   if(index<0)throw new RangeError("Zählerdatensatz fehlt");
   const old=o.meterRegistry[index],row=assertMeterFields(o,fields,old);
   if(meterReferenced(o,old)&&old.status==="retired"&&row.status==="active")
     throw new RangeError("Historisch ausgebauten Zähler nicht reaktivieren – neuen Zähler anlegen");
   o.meterRegistry[index]={...old,...row};
   if(row.status==="active")updateLegacyWaterAlias(o,row.unitId,row.type,row.number);
   else if(["cold","hot"].includes(row.type)){
     const u=o.units.find(x=>x.id===row.unitId);
     if(u?.meters?.[row.type]===old.number)updateLegacyWaterAlias(o,row.unitId,row.type,"");
   }
   o.revision++;touch(p,o);return validate(p);
 }
 function retireMeter(input,objectId,meterId){
   const p=upgradePortfolio(input),o=p.objects.find(x=>x.id===objectId);
   if(!o||o.lifecycle.status!=="active")throw new RangeError("Aktives Objekt fehlt");
   const m=o.meterRegistry.find(x=>x.id===meterId);
   if(!m)throw new RangeError("Zählerdatensatz fehlt");
   if(m.status==="retired")throw new RangeError("Zähler bereits außer Betrieb");
   if(m.status==="placeholder")
     throw new RangeError("Unbenutzten Musterplatzhalter direkt löschen");
   m.status="retired";
   const u=o.units.find(x=>x.id===m.unitId);
   if(["cold","hot"].includes(m.type)&&u?.meters?.[m.type]===m.number)
     updateLegacyWaterAlias(o,m.unitId,m.type,"");
   o.revision++;touch(p,o);return validate(p);
 }
 function deleteUnusedMeter(input,objectId,meterId){
   const p=upgradePortfolio(input),o=p.objects.find(x=>x.id===objectId);
   if(!o||o.lifecycle.status!=="active")throw new RangeError("Aktives Objekt fehlt");
   const m=o.meterRegistry.find(x=>x.id===meterId);
   if(!m)throw new RangeError("Zählerdatensatz fehlt");
   if(meterReferenced(o,m))
     throw new RangeError("Zähler ist in einer Jahresabrechnung referenziert. Stattdessen außer Betrieb setzen.");
   o.meterRegistry=o.meterRegistry.filter(x=>x.id!==meterId);
   const u=o.units.find(x=>x.id===m.unitId);
   if(["cold","hot"].includes(m.type)&&u?.meters?.[m.type]===m.number)
     updateLegacyWaterAlias(o,m.unitId,m.type,"");
   o.revision++;touch(p,o);return validate(p);
 }

 const stamp=()=>new Date().toISOString();
 const newId=(prefix)=>{
   const cryptoApi=typeof globalThis!=="undefined"?globalThis.crypto:null;
   const uuid=cryptoApi&&typeof cryptoApi.randomUUID==="function"?cryptoApi.randomUUID():
     "test-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,14);
   return prefix+uuid.toUpperCase();
 };
 // Cloud-facing records have independent revision boundaries: object master and each annual.
 // Existing 0.7 portfolios are upgraded in place at the same local storage key.
 function upgradePortfolio(input){
   const p=copy(input);
   if(p?.schema!==SCHEMA||p.fixture!==true||!Array.isArray(p.objects))
     throw new TypeError("Unbekannter oder nicht-synthetischer Datenbestand");
   p.sync=p.sync||{format:2,revision:1,updatedAt:null};
   p.sync.format=2;
   p.tombstones=Array.isArray(p.tombstones)?p.tombstones:[];
   for(const o of p.objects){
     o.lifecycle=o.lifecycle||{status:"active",archivedAt:null};
     o.sync=o.sync||{version:1,updatedAt:null};
     if(!Array.isArray(o.meterRegistry))o.meterRegistry=initialRegistry(o);
     for(const a of Object.values(o.settlements||{}))a.sync=a.sync||{version:1,updatedAt:null};
   }
   return validate(p);
 }
 function touch(p,o){
   const at=stamp();
   o.sync={version:(o.sync?.version||0)+1,updatedAt:at};
   p.sync={format:2,revision:(p.sync?.revision||0)+1,updatedAt:at};
 }
 function touchYear(p,o,a){
   const at=stamp();
   a.sync={version:(a.sync?.version||0)+1,updatedAt:at};
   p.sync={format:2,revision:(p.sync?.revision||0)+1,updatedAt:at};
 }

 const date=s=>{if(typeof s!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+"T00:00:00Z");return !Number.isNaN(d.valueOf())&&d.toISOString().slice(0,10)===s};
 const days=(a,b)=>(Date.parse(b+"T00:00:00Z")-Date.parse(a+"T00:00:00Z"))/86400000+1;
 const yr=y=>/^(19|20|21)\d{2}$/.test(String(y)),pad=n=>String(n).padStart(2,"0");
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
   return upgradePortfolio({schema:SCHEMA,fixture:true,version:1,selectedObjectId:a.id,selectedYear:"2025",objects});
 }
 function validate(p){
   if(p?.schema!==SCHEMA||p.fixture!==true||!Array.isArray(p.objects))
     throw new TypeError("Only synthetic NK-Pro portfolios are allowed");
   const ids=new Set();
   for(const o of p.objects){
     if(!o?.id||ids.has(o.id)||!Array.isArray(o.units)||!Array.isArray(o.tenancies)||
       !o.settlements||typeof o.settlements!=="object"||
       !["active","archived"].includes(o.lifecycle?.status||"active"))
       throw new TypeError("Incomplete or duplicate property master");
     ids.add(o.id);
     const unitIds=new Set(o.units.map(u=>u.id));
     const tenantIds=new Set(o.tenancies.map(t=>t.id));
     if(!Array.isArray(o.meterRegistry))throw new TypeError("Zählerstamm fehlt");
     const meterIds=new Set(o.meterRegistry.map(m=>m.id));
     if(meterIds.size!==o.meterRegistry.length||
       o.meterRegistry.some(m=>!m?.id||!unitIds.has(m.unitId)||!METER_TYPES[m.type]||
       !meterStatus[m.status]))
       throw new TypeError("Zählerstammdaten enthalten doppelte IDs oder ungültige Zuordnungen");
     for(const unitId of unitIds)for(const type of ["cold","hot"]){
       const active=o.meterRegistry.filter(m=>m.unitId===unitId&&m.type===type&&m.status==="active");
       if(active.length>1)throw new TypeError("Doppelte aktive Wasserzähler");
     }
     if(unitIds.size!==o.units.length||tenantIds.size!==o.tenancies.length||
       o.tenancies.some(t=>!unitIds.has(t.unitId)))
       throw new TypeError("Invalid apartment / tenancy relationship");
     for(const [year,a] of Object.entries(o.settlements))
       if(!yr(year)||a?.fixture!==true||a.period!==year||
         !Array.isArray(a.units)||!Array.isArray(a.tenancies))
         throw new TypeError("Invalid synthetic annual record");
   }
   const tombstones=p.tombstones||[];
   if(!Array.isArray(tombstones)||tombstones.some(t=>!t?.id||t.type!=="object"||ids.has(t.id))||
     new Set(tombstones.map(t=>t.id)).size!==tombstones.length)
      throw new TypeError("Invalid deletion markers");
   const active=p.objects.filter(o=>(o.lifecycle?.status||"active")==="active");
   if(p.selectedObjectId==null){
     if(active.length)throw new TypeError("Active context missing");
   }else{
     const selected=active.find(o=>o.id===p.selectedObjectId);
     if(!selected)throw new TypeError("Selected object is missing or archived");
     if(p.selectedYear!=null&&!selected.settlements[String(p.selectedYear)])
       throw new TypeError("Selected annual context missing");
     if(p.selectedYear==null&&Object.keys(selected.settlements).length)
       throw new TypeError("Annual context required for object with settlements");
   }
   return p;
 }
 const object=(p,id)=>validate(p).objects.find(x=>x.id===(id||p.selectedObjectId))||null;
 const annual=(p,id,year)=>year==null?null:(object(p,id)?.settlements[String(year)]||null);
 const current=p=>annual(p,p.selectedObjectId,p.selectedYear);
 const readonly=a=>!a||a.settlement?.status!=="draft";
 function selectObject(input,id){
   const p=upgradePortfolio(input),o=p.objects.find(x=>x.id===id);
   if(!o||o.lifecycle.status!=="active")throw new RangeError("Objekt fehlt oder ist archiviert");
   p.selectedObjectId=id;p.selectedYear=o.settlements["2025"]?"2025":
     (Object.keys(o.settlements).sort().at(-1)||null);
   return validate(p);
 }
 function selectYear(input,id,year){
   const p=upgradePortfolio(input),o=p.objects.find(x=>x.id===id);
   if(!o||o.lifecycle.status!=="active"||!o.settlements[String(year)])
     throw new RangeError("Abrechnungsjahr fehlt oder Objekt ist archiviert");
   p.selectedObjectId=id;p.selectedYear=String(year);return validate(p);
 }
 function editMaster(input,id,kind,entry){
   const p=upgradePortfolio(input),o=p.objects.find(x=>x.id===id);
   if(!o||o.lifecycle.status!=="active")throw new RangeError("Objekt fehlt oder ist archiviert");
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
   o.revision=(Number(o.revision)||0)+1;touch(p,o);return validate(p);
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
   const diff=rebasePreview(input,id,year),p=upgradePortfolio(input),
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
   touchYear(p,o,a);return validate(p);
 }
 function selectFallback(p){
   const next=p.objects.find(o=>o.lifecycle.status==="active");
   p.selectedObjectId=next?.id||null;
   p.selectedYear=next?(next.settlements["2025"]?"2025":
     Object.keys(next.settlements).sort().at(-1)||null):null;
 }
 function addObject(input,fields){
   const p=upgradePortfolio(input);
   const clean=k=>String(fields?.[k]||"").trim();
   const name=clean("name"),street=clean("street"),postalCode=clean("postalCode"),city=clean("city");
   if(!name||!street||!postalCode||!city||name.length>90||street.length>120||
     postalCode.length>12||city.length>80)
     throw new TypeError("Objektname und vollständige fiktive Anschrift erforderlich");
   let id=newId("SYN-OBJ-");
   while(p.objects.some(o=>o.id===id)||p.tombstones.some(t=>t.id===id))id=newId("SYN-OBJ-");
   const o={id,name,street,postalCode,city,revision:1,units:[],tenancies:[],meterRegistry:[],settlements:{},
     lifecycle:{status:"active",archivedAt:null},sync:{version:0,updatedAt:null}};
   p.objects.push(o);
   touch(p,o);
   p.selectedObjectId=id;p.selectedYear=null;
   return validate(p);
 }
 function addUnit(input,objectId,fields){
   const p=upgradePortfolio(input),o=p.objects.find(x=>x.id===objectId);
   if(!o||o.lifecycle.status!=="active")throw new RangeError("Aktives Objekt fehlt");
   const label=String(fields?.label||"").trim(),position=String(fields?.position||"").trim();
   const area=Number(fields?.area);
   if(!label||!position||label.length>70||position.length>100||
     !Number.isFinite(area)||area<=0||area>1000000)
     throw new TypeError("Gültige Wohnungsbezeichnung, Lage und Fläche erforderlich");
   const unit={id:newId("SYN-W-"),label,position,area,active:true,
     meters:{cold:newId("DEMO-KW-"),hot:newId("DEMO-WW-")}};
   o.units.push(unit);
   // New apartments get their own independent meter records, including clearly marked demos.
   o.meterRegistry.push(...initialRegistry({units:[unit]}));
   o.revision++;touch(p,o);
   return validate(p);
 }
 function addYear(input,objectId,year){
   const p=upgradePortfolio(input),o=p.objects.find(x=>x.id===objectId);
   const y=String(year);
   if(!o||o.lifecycle.status!=="active"||!yr(y)||o.settlements[y])
     throw new RangeError("Objekt/Jahr ungültig oder bereits vorhanden");
   if(!o.units.length||!project(o,y).length)
     throw new RangeError("Vor dem Jahresentwurf Wohnungen und gültige Mietverhältnisse anlegen");
   for(const u of o.units)for(const type of ["cold","hot"])
     if(!o.meterRegistry.some(m=>m.unitId===u.id&&m.type===type&&m.status==="active"))
       throw new RangeError("Vor einer neuen Jahresabrechnung müssen aktive KW-/WW-Zähler vorhanden sein");
   const a=syntheticYear(o,y);
   a.settlement={...a.settlement,status:"draft",readOnly:false,
     createdFrom:"new-object-synthetic-template"};
   a.sync={version:0,updatedAt:null};
   o.settlements[y]=a;touchYear(p,o,a);
   p.selectedObjectId=objectId;p.selectedYear=y;
   return validate(p);
 }
 function archiveObject(input,id){
   const p=upgradePortfolio(input),o=p.objects.find(x=>x.id===id);
   if(!o||o.lifecycle.status!=="active")throw new RangeError("Aktives Objekt fehlt");
   o.lifecycle={status:"archived",archivedAt:stamp()};
   touch(p,o);if(p.selectedObjectId===id)selectFallback(p);
   return validate(p);
 }
 function restoreObject(input,id){
   const p=upgradePortfolio(input),o=p.objects.find(x=>x.id===id);
   if(!o||o.lifecycle.status!=="archived")throw new RangeError("Archiviertes Objekt fehlt");
   o.lifecycle={status:"active",archivedAt:null};touch(p,o);
   if(!p.selectedObjectId)selectFallback(p);
   return validate(p);
 }
 function deleteEmptyObject(input,id){
   const p=upgradePortfolio(input),o=p.objects.find(x=>x.id===id);
   if(!o)throw new RangeError("Objekt fehlt");
   if(o.units.length||o.tenancies.length||Object.keys(o.settlements).length)
     throw new RangeError("Objekt besitzt Daten. Nur archivieren ist zulässig.");
   p.tombstones.push({type:"object",id,deletedAt:stamp(),
     previousVersion:o.sync.version});
   p.objects=p.objects.filter(x=>x.id!==id);
   p.sync={format:2,revision:(p.sync?.revision||0)+1,updatedAt:stamp()};
   if(p.selectedObjectId===id)selectFallback(p);
   return validate(p);
 }
 function saveYear(input,id,year,next){
   const p=upgradePortfolio(input),o=p.objects.find(x=>x.id===id),y=String(year);
   if(!o||o.lifecycle.status!=="active"||!o.settlements[y]||
     readonly(o.settlements[y])||next?.period!==y||next.fixture!==true||
     readonly(next))throw new RangeError("Jahresdaten sind nicht editierbar");
   o.settlements[y]=copy(next);touchYear(p,o,o.settlements[y]);
   return validate(p);
 }
 // Adapter-neutral, per-record snapshots. Browser selection is intentionally NOT synchronized.
 // A deleted empty object remains a tombstone; never silently resurrect it on remote sync.
 function syncSnapshot(input){
   const p=upgradePortfolio(input),records=[];
   for(const o of p.objects){
     const {settlements,...master}=copy(o);
     records.push({key:"object/"+o.id,version:o.sync.version,payload:master});
     for(const [year,a] of Object.entries(settlements))
       records.push({key:"annual/"+o.id+"/"+year,version:a.sync.version,
         payload:{objectId:o.id,year,data:a}});
   }
   for(const t of p.tombstones)
     records.push({key:"object/"+t.id,version:t.previousVersion+1,
       payload:{deleted:true,type:"object",id:t.id,deletedAt:t.deletedAt}});
   return{schema:"nkpro2-sync-records-v1",records:records.sort((a,b)=>a.key.localeCompare(b.key))};
 }
 // Three-way sync planner: when both local and remote differ from the last confirmed base,
 // issue a conflict. The planner never applies updates or performs network I/O.
 function planSync(base,local,remote){
   for(const x of [base,local,remote])
     if(x?.schema!=="nkpro2-sync-records-v1"||!Array.isArray(x.records))
       throw new TypeError("Ungültiges Synchronisationsmanifest");
   const asMap=x=>{
     const m=new Map();
     for(const r of x.records){if(!r?.key||m.has(r.key))throw new TypeError("Doppelte Sync-ID");m.set(r.key,r);}
     return m;
   };
   const b=asMap(base),l=asMap(local),r=asMap(remote),upload=[],download=[],conflicts=[];
   const eql=(x,y)=>JSON.stringify(x?.payload??null)===JSON.stringify(y?.payload??null);
   for(const key of new Set([...b.keys(),...l.keys(),...r.keys()])){
     const old=b.get(key),mine=l.get(key),theirs=r.get(key);
     if(eql(mine,theirs))continue;
     const lm=!eql(mine,old),rm=!eql(theirs,old);
     if(lm&&rm)conflicts.push(key);
     else if(lm)upload.push(key);
     else if(rm)download.push(key);
   }
   return{upload,download,conflicts,canApply:conflicts.length===0};
 }
 return{SCHEMA,create,validate,upgradePortfolio,object,annual,current,readonly,project,
  selectObject,selectYear,editMaster,addObject,addUnit,addYear,archiveObject,restoreObject,
  deleteEmptyObject,saveYear,rebasePreview,rebaseDraft,syncSnapshot,planSync,statusLabel,
  METER_TYPES,meterStatus,addMeter,editMeter,retireMeter,deleteUnusedMeter,meterReferenced,
  version:"synthetic-estates-v3"};
});