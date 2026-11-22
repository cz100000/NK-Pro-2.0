/* NK-Pro 2.0 Stufe 4: synthetische Einzelbrief-Vorschau.
 * Vollständige fachliche Original-/A4-Abnahme ist NICHT implementiert.
 */
(function(root,factory){const api=Object.freeze(factory());if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.NKPRO2_LETTERS=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const escape=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=c=>(Number(c)/100).toLocaleString("de-DE",{style:"currency",currency:"EUR"});
const date=s=>{const d=new Date(String(s)+"T00:00:00Z");return /^\d{4}-\d{2}-\d{2}$/.test(String(s))&&!Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s};
function make(state,ledger){
 if(!state||state.fixture!==true||state.period!=="2025"||!Array.isArray(ledger?.tenants))
   throw new TypeError("Synthetic-only letters");
 const config=state.letterSettings||{},errors=[],warnings=[],missingRecipients=[];
 if(!config.senderName?.trim())errors.push("Absendername fehlt.");
 if(!config.senderStreet?.trim()||!config.senderCity?.trim())errors.push("Absenderanschrift fehlt.");
 if(!date(config.letterDate))errors.push("Briefdatum fehlt oder ist ungültig.");
 if(!date(config.paymentDue))warnings.push("Zahlungsziel fehlt oder ist ungültig.");
 if(!config.signature?.trim())warnings.push("Unterschrift/Signatur fehlt.");
 const letters=ledger.tenants.map(result=>{
   const t=state.tenancies.find(x=>x.id===result.id)||{},u=state.units.find(x=>x.id===result.unitId)||{};
   const missing=["recipientStreet","recipientPostalCode","recipientCity"].filter(k=>!t[k]?.trim());
   if(missing.length)missingRecipients.push(result.id);
   const sal=t.salutation==="Herr"?"Sehr geehrter Herr "+(t.lastName||t.name)+",":
     t.salutation==="Frau"?"Sehr geehrte Frau "+(t.lastName||t.name)+",":
     t.salutation==="individuell"&&t.customSalutation?t.customSalutation:"Guten Tag,";
   const items=ledger.costs.map(c=>({id:c.id,name:c.name,method:c.method,
     cents:c.rows.filter(x=>x.tenantId===result.id).reduce((a,x)=>a+x.cents,0)}));
   if(items.reduce((a,x)=>a+x.cents,0)!==result.costCents)
      errors.push("Kostenzeilen im Brief weichen ab: "+result.id);
   return{id:result.id,name:t.name||result.name,unit:u.label||result.unitId,
     street:t.recipientStreet||"",postalCode:t.recipientPostalCode||"",city:t.recipientCity||"",
     salutation:sal,items,costCents:result.costCents,
     paidCents:result.advanceCents,balanceCents:result.balanceCents,missing};
 });
 return{letters,config,errors,warnings,missingRecipients,
   dataReady:errors.length===0&&missingRecipients.length===0&&letters.length>0,
   readyForPrint:false,readyForRealFinalization:false,
   status:"Synthetischer Briefentwurf – nicht A4- oder fachlich freigegeben"};
}
function html(letter,config={}){
 const safe=x=>escape(x||"NICHT ERFASST"),intro=String(config.openingText||"")
   .replaceAll("{zeitraum}","01.01.2025 bis 31.12.2025");
 const saldo=letter.balanceCents>0?"Nachzahlung":letter.balanceCents<0?"Guthaben":"Ausgeglichen";
 return '<article class="doc-paper letter-a4-draft">'+
 '<div class="doc-top">'+safe(config.senderName)+' · SYNTHETISCHE BRIEFVORSCHAU</div>'+
 '<div class="doc-address">'+safe(letter.name)+'<br>'+safe(letter.street)+'<br>'+
 safe(letter.postalCode)+' '+safe(letter.city)+'</div>'+
 '<div class="letter-meta">'+escape(config.senderStreet||"")+' · '+escape(config.senderCity||"")+
 ' · '+escape(config.letterDate||"Datum fehlt")+'</div>'+
 '<h2 class="doc-title">'+escape(config.subject||'Nebenkostenabrechnung 2025')+' · '+escape(letter.unit)+'</h2>'+
 '<div class="doc-prose">'+escape(letter.salutation)+'<br><br>'+escape(intro)+'</div>'+
 '<table class="letter-cost-table"><thead><tr><th>Kostenposition</th><th>Verteilung</th><th>Mein Anteil</th></tr></thead><tbody>'+
 letter.items.map(i=>'<tr><td>'+escape(i.name)+'</td><td>'+escape(i.method)+'</td>'+
 '<td>'+money(i.cents)+'</td></tr>').join('')+'</tbody></table>'+
 '<div class="doc-results"><div><small>Kostenanteil</small><b>'+money(letter.costCents)+'</b></div>'+
 '<div><small>Geleistete Vorauszahlungen</small><b>'+money(letter.paidCents)+'</b></div>'+
 '<div><small>'+saldo+'</small><b>'+money(Math.abs(letter.balanceCents))+'</b></div></div>'+
 '<div class="doc-prose">'+escape(letter.balanceCents>0?(config.paymentText||''):(config.creditText||''))+
 (letter.balanceCents>0&&config.paymentDue?' Zahlungsziel: '+escape(config.paymentDue):'')+
 (config.bankAccount?' · Bankverbindung: '+escape(config.bankAccount):'')+'</div>'+
 '<div class="doc-prose">'+escape(config.closingText||"")+'</div>'+
 '<div class="doc-sign">'+escape(config.greeting||'Mit freundlichen Grüßen')+'<strong>'+safe(config.signature)+'</strong></div>'+
 '<div class="letter-annex">'+escape(config.annexText||"")+'</div>'+
 '<div class="demo-watermark">FACHTEST · NICHT VERSENDEN</div></article>';
}
return{make,html,version:"stage4-synthetic-letter-preview-1"};
});