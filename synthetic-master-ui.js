/* Isolated master-data editors for synthetic portfolio. Single write owner. */
(function(root,factory){"use strict";const api=Object.freeze(factory());if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.NKPRO2_MASTER_UI=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){"use strict";
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const field=(label,name,value,type="text",extra="")=>
   '<div class="form-row"><label>'+label+'<input name="'+name+'" type="'+type+'" '+extra+' value="'+esc(value??"")+'"></label></div>';
 const select=(label,name,values,selected)=>'<div class="form-row"><label>'+label+'<select name="'+name+'">'+
   values.map(([value,text])=>'<option value="'+esc(value)+'" '+(selected===value?'selected':'')+'>'+esc(text)+'</option>').join('')+
   '</select></label></div>';
 const form=(type,o,id)=>{
   let title="",body="",draft=null;
   if(type==="master-property"){
     title=o.name;
     body=field("Objektbezeichnung","name",o.name,"text","required maxlength=90")+
       field("Straße und Hausnummer (nur fiktiv)","street",o.street,"text","required maxlength=120")+
       '<div class="water-form-grid">'+field("PLZ","postalCode",o.postalCode,"text","required maxlength=12")+
       field("Ort","city",o.city,"text","required maxlength=80")+'</div>'+
       '<div class="drawer-note">Objekt-ID '+esc(o.id)+'. Bestehende Jahresstände bleiben bis zu einem gesonderten, kontrollierten Stammdatenabgleich unverändert.</div>';
   }else if(type==="master-unit"){
     const u=o.units.find(x=>x.id===id);if(!u)return null;
     title=u.label;
     body='<div class="drawer-note">Wohnungs-ID '+esc(u.id)+' · '+esc(o.name)+
       '. Die technische ID bleibt stabil.</div>'+
       field("Wohnungsbezeichnung","label",u.label,"text","required maxlength=70")+
       field("Lage / Geschoss","position",u.position,"text","maxlength=100")+
       field("Wohnfläche (m²)","area",u.area,"number","required min=0.01 step=0.01")+
       '<div class="drawer-note">Stammzähler KW '+esc(u.meters.cold)+
       ' · WW '+esc(u.meters.hot)+'. Jahresablesungen gehören zur Abrechnung.</div>';
   }else if(type==="master-meter"||type==="new-master-meter"){
     const fresh=type==="new-master-meter";
     const meter=fresh?{id:null,unitId:id&&o.units.some(u=>u.id===id)?id:o.units[0]?.id,
       type:"electricity",number:"",status:"placeholder",room:"",radiator:"",
       installedOn:null,removedOn:null,note:""}:o.meterRegistry?.find(m=>m.id===id);
     if(!meter)return null;
     title=fresh?"Zähler anlegen":"Zähler bearbeiten";
     const types=[["cold","Kaltwasser"],["hot","Warmwasser"],["electricity","Strom"],
       ["heat","Techem-Heizkostenverteiler"]];
     body='<div class="drawer-note">Jeder physische Zähler besitzt eine stabile ID. Die Zählerstammdaten werden hier gepflegt; Jahresablesungen ausschließlich unter Jahresabrechnungen → Verbräuche.</div>'+
       (fresh?
         select("Wohnung","unitId",o.units.map(u=>[u.id,u.label]),meter.unitId)+
         select("Zählertyp","type",types,meter.type):
         '<div class="meter-fixed-context"><strong>'+esc(o.units.find(u=>u.id===meter.unitId)?.label||meter.unitId)+
         '</strong><span>'+esc(types.find(x=>x[0]===meter.type)?.[1]||meter.type)+'</span></div>'+
         '<input type="hidden" name="unitId" value="'+esc(meter.unitId)+'">'+
         '<input type="hidden" name="type" value="'+esc(meter.type)+'">')+
       field("Zählernummer (bei Platzhaltern optional)","number",meter.number,"text","maxlength=100")+
       '<div class="water-form-grid">'+field("Raum (bei Techem erforderlich)","room",meter.room,"text","maxlength=100")+
       field("Heizkörper / Montageort","radiator",meter.radiator,"text","maxlength=100")+'</div>'+
       select("Status","status",[["placeholder","Musterplatzhalter"],["active","Aktiv"],
         ["retired","Außer Betrieb"]],meter.status)+
       '<div class="water-form-grid">'+field("Einbaudatum (optional)","installedOn",meter.installedOn,"date")+
       field("Ausbaudatum (optional)","removedOn",meter.removedOn,"date")+'</div>'+
       '<div class="form-row"><label>Interne Bemerkung<textarea name="note" maxlength="1000" rows="3">'+
         esc(meter.note||"")+'</textarea></label></div>'+
       '<div class="drawer-note">Wird ein historisch verwendeter Wasserzähler ausgetauscht, bleibt sein Datensatz erhalten. Alten Zähler außer Betrieb setzen und einen neuen anlegen. Bestehende Jahresabrechnungen ändern sich nicht automatisch.</div>';
   }else if(type==="master-tenancy"||type==="new-master-tenancy"){
     const fresh=type==="new-master-tenancy";
     const t=fresh?{id:"SYN-M-"+Date.now().toString(36).toUpperCase(),
       unitId:o.units[0].id,firstName:"Neue",lastName:"Musterperson",leaseStart:"2024-01-01",
       leaseEnd:null,role:"Mieter",persons:1,salutation:"neutral",postalOverride:null,
       customSalutation:"",note:""}:o.tenancies.find(x=>x.id===id);
     if(!t)return null;draft=t;
     title=fresh?"Muster-Mietverhältnis hinzufügen":t.name;
     const addr=t.postalOverride||{};
     body='<div class="drawer-note">Vertrags-ID '+esc(t.id)+
       '. Die Daten werden ausschließlich im Objektstamm gepflegt.</div>'+
       '<div class="water-form-grid">'+field("Vorname","firstName",t.firstName,"text","maxlength=80")+
       field("Nachname","lastName",t.lastName,"text","required maxlength=80")+'</div>'+
       select("Wohnung","unitId",o.units.map(u=>[u.id,u.label+" · "+u.id]),t.unitId)+
       select("Nutzungsart","role",[["Mieter","Mieter"],["Privatanteil","Privatanteil"],
         ["Eigennutzung","Eigennutzung"]],t.role)+
       '<div class="water-form-grid">'+field("Einzugsdatum","leaseStart",t.leaseStart,"date","required")+
       field("Auszugsdatum (optional)","leaseEnd",t.leaseEnd,"date")+'</div>'+
       '<p class="form-help">Ohne Auszugsdatum gilt das Mietverhältnis weiterhin. Jahresfälle werden automatisch zeitlich begrenzt.</p>'+
       field("Personenzahl","persons",t.persons,"number","required min=0 max=1000 step=1")+
       select("Briefanrede","salutation",[["neutral","Neutral"],["Herr","Herr"],
         ["Frau","Frau"],["individuell","Individuell"]],t.salutation||"neutral")+
       field("Individuelle Anrede (optional)","customSalutation",t.customSalutation,"text","maxlength=160")+
       '<details class="cost-exceptions"><summary>Abweichende Zustellanschrift (optional)</summary>'+
       '<p class="form-help">Ohne abweichende Anschrift wird '+esc(o.street)+", "+esc(o.postalCode)+" "+esc(o.city)+' verwendet.</p>'+
       field("Abweichende Straße","postalStreet",addr.street,"text","maxlength=120")+
       '<div class="water-form-grid">'+field("PLZ","postalCode",addr.postalCode,"text","maxlength=12")+
       field("Ort","postalCity",addr.city,"text","maxlength=80")+'</div></details>'+
       '<div class="form-row"><label>Interne Notiz<textarea name="note" maxlength="2000" rows="3">'+
         esc(t.note||"")+'</textarea></label></div>'+
       '<div class="drawer-note">Nach dem Speichern bleiben alle vorhandenen Jahresabrechnungen unverändert. In offenen Entwürfen ist ein kontrollierter Abgleich erforderlich.</div>';
   }else return null;
   return{title,eyebrow:"DAUERHAFTE STAMMDATEN · "+o.id,
     body:'<form id="editForm" data-type="'+type+'">'+body+'</form>',draft};
 };
 function parse(type,els,id,draft){
   const str=k=>String(els[k]?.value??"").trim();
   if(type==="master-property")
     return{kind:"property",entry:{name:str("name"),street:str("street"),
       postalCode:str("postalCode"),city:str("city")}};
   if(type==="master-unit")
     return{kind:"unit",entry:{id,label:str("label"),position:str("position"),area:Number(str("area"))}};
   if(type==="master-meter"||type==="new-master-meter"){
     return{kind:"meter",entry:{id:type==="master-meter"?id:null,unitId:str("unitId"),
       type:str("type"),number:str("number"),room:str("room"),radiator:str("radiator"),
       status:str("status"),installedOn:str("installedOn")||null,
       removedOn:str("removedOn")||null,note:str("note")}};
   }
   if(type==="master-tenancy"||type==="new-master-tenancy"){
     const street=str("postalStreet"),zip=str("postalCode"),city=str("postalCity");
     if((street||zip||city)&&(!street||!zip||!city))
       throw new RangeError("Abweichende Postanschrift bitte vollständig angeben oder leer lassen");
     return{kind:"tenancy",entry:{...draft,id:draft.id,unitId:str("unitId"),
       firstName:str("firstName"),lastName:str("lastName"),
       role:str("role"),persons:Number(str("persons")),leaseStart:str("leaseStart"),
       leaseEnd:str("leaseEnd")||null,salutation:str("salutation"),
       customSalutation:str("customSalutation"),
       postalOverride:street?{street,postalCode:zip,city}:null,
       note:str("note").slice(0,2000)}};
   }
   throw new RangeError("Unbekannte Stammdatenbearbeitung");
 }
 return{form,parse,version:"synthetic-master-editors-v2"};
});