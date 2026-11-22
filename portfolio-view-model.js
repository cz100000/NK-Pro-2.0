/* NK-Pro 2.0 display-only adapter.
 * Real historical data enters the EXISTING v0.13 object/year navigation contract.
 * It cannot become a synthetic billing fixture and cannot be written to 1.0.
 * Sample B and C are passed through without transformation. */
(function(root,factory){"use strict";
 const api=Object.freeze(factory());
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
 else root.NKPRO2_PORTFOLIO_VIEW=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){"use strict";
 const copy=x=>JSON.parse(JSON.stringify(x));
 const need=(v,msg)=>{if(!v)throw new Error(msg);};
 function genuineObject(live){
  const validate=globalThis.NKPRO2_INTEGRATED_DATA?.validate;
  need(typeof validate==="function","REAL_DATA_VALIDATOR_MISSING");
  validate(live);
  const o=live.objects[0];
  need(o?.annual?.["2025"]?.importedFromLegacy===false,"LEGACY_2025_NOT_ALLOWED");
  need(o.units.length===7&&o.tenancies.length===5,"REAL_MASTER_COUNT_MISMATCH");
  need(o.archives.every(a=>a.immutable&&a.year!=="2025"),"REAL_ARCHIVE_NOT_IMMUTABLE");
  const byYear=new Map();
  for(const a of o.archives){
   const key=String(a.year);
   if(!byYear.has(key))byYear.set(key,[]);
   byYear.get(key).push(copy(a));
  }
  const settlements={
   "2025":{period:"2025",fixture:false,source:"nkpro2-new-year",
    navigationLabel:"Neu · In Bearbeitung",
    settlement:{year:"2025",status:"draft",readOnly:true},archivedOriginals:[],
    costs:[],payments:{},units:[],tenancies:[]}
  };
  for(const [year,originals] of byYear){
   need(year!=="2025"&&!Object.prototype.hasOwnProperty.call(settlements,year),
    "YEAR_DUPLICATE_OR_2025");
   settlements[year]={period:year,fixture:false,source:"legacy-immutable-history",
    navigationLabel:"Historischer Bestand",
    settlement:{year,status:"archived",readOnly:true},
    archivedOriginals:originals,
    costs:[],payments:{},units:[],tenancies:[]};
  }
  const sourceUnits=o.units.map(u=>({id:u.id,label:u.label,position:u.position,
   area:u.area,active:u.active,meters:{cold:"",hot:""}}));
  const ids=new Set(sourceUnits.map(u=>u.id));
  const sourceTenancies=o.tenancies.map(t=>({
   id:t.id,unitId:t.unitId,firstName:t.firstName,lastName:t.lastName,
   name:t.name,role:t.role,persons:t.persons,leaseStart:t.leaseStart,
   leaseEnd:t.leaseEnd,salutation:t.salutation||"neutral",
   customSalutation:"",postalOverride:t.street?{street:t.street,
    postalCode:t.postalCode,city:t.city}:null,note:t.note||""
  }));
  const meterRegistry=o.meterRegistry.map(m=>({
   id:m.id,unitId:m.unitId,type:m.type,number:m.number,room:m.room||"",
   radiator:"",status:/^(aktiv|active)$/i.test(String(m.status||""))?"active":
   /^(inaktiv|retired|ausgebaut)$/i.test(String(m.status||""))?"retired":
    "placeholder",installedOn:m.installedOn,removedOn:m.removedOn,
    originalType:m.legacyType||m.type,originalStatus:m.status
  }));
  need(new Set(o.archives.map(a=>a.id)).size===o.archives.length,
   "ORIGINAL_ARCHIVE_IDS_NOT_UNIQUE");
  need(sourceTenancies.every(t=>ids.has(t.unitId)),"REAL_TENANCY_LINK_INVALID");
  return {id:o.id,name:o.name,street:o.street,postalCode:o.postalCode,
   city:o.city,revision:1,units:sourceUnits,tenancies:sourceTenancies,
   meterRegistry,settlements,lifecycle:{status:"active"},
   sourceKind:"real",sourceArchiveCount:o.archives.length,sourceCode:o.code,
   sourceIntegrityId:live.source.snapshotId,sourceYear2025Empty:true};
 }
 function compose(demo,live){
  need(demo?.schema==="nkpro2-estates-synthetic-v1"&&demo.fixture===true&&
   Array.isArray(demo.objects),"DEMO_PORTFOLIO_INVALID");
  const synthetic=copy(demo);
  if(!live)return synthetic;
  const real=genuineObject(live);
  const b=synthetic.objects.find(o=>o.id==="SYN-B");
  const c=synthetic.objects.find(o=>o.id==="SYN-C");
  need(b&&c,"SAMPLE_B_C_MISSING");
  const p={...synthetic,objects:[real,b,c],selectedObjectId:real.id,
   selectedYear:"2025"};
  need(p.objects.length===3&&p.objects[0].id===real.id,"DISPLAY_OBJECT_COUNT");
  return p;
 }
 return Object.freeze({genuineObject,compose});
});