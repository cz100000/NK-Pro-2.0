/* NK-Pro 2.0 Fachtest 0.13 – user-friendly workspace for the verbatim AP13 renderer.
 * Presentation only. All letter data/amounts come from the annual synthetic ledger.
 */
(function(root,factory){"use strict";
 const api=Object.freeze(factory());
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
 else root.NKPRO2_LETTER_WORKSPACE=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const esc=x=>String(x??"").replace(/[&<>"']/g,c=>
   ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const money=x=>Number(x||0).toLocaleString("de-DE",{style:"currency",currency:"EUR"});
 const br=(label,name,value,type="text",max=180)=>{
   const v=esc(value??"");
   return '<div class="form-row"><label>'+esc(label)+
      '<input name="'+esc(name)+'" type="'+type+'" maxlength="'+max+'" value="'+v+'"></label></div>';
 };
 const textarea=(label,name,value)=>
   '<div class="form-row"><label>'+esc(label)+
   '<textarea rows="3" maxlength="4000" name="'+esc(name)+'">'+esc(value??"")+'</textarea></label></div>';
 const group=(title,body,open=false)=>'<details class="letter-config-group"'+(open?' open':'')+
   '><summary>'+esc(title)+'</summary><div class="letter-config-body">'+body+'</div></details>';
 function form(data,settings,person,locked){
   if(!person)return"";
   const s=settings,rows=data.letterSettings?.prepaymentRows||[];
   const current=rows.filter(r=>r.tenantId===person.id);
   const prepaid=data.costs.filter(c=>c.active!==false).map(c=>{
     const record=current.find(r=>r.costId===c.id);
     return '<div class="letter-prepay-row" data-prepay-cost="'+esc(c.id)+'">'+
       '<span>'+esc(c.sourceId||c.id)+' · '+esc(c.name)+'</span>'+
       '<label>Alt (€)<input type="number" min="0" step="0.01" name="prepayOld_'+esc(c.id)+
       '" value="'+esc(record?.oldMonthly??'')+'"></label>'+
       '<label>Neu (€)<input type="number" min="0" step="0.01" name="prepayNew_'+esc(c.id)+
       '" value="'+esc(record?.newMonthly??'')+'"></label></div>';
   }).join('');
   const delivery=group("Briefkopf und Versanddaten",
     br("Absender / Vermieter", "absenderName",s.absenderName)+
     br("Absenderstraße", "absenderStrasse",s.absenderStrasse)+
     br("PLZ und Ort des Absenders", "absenderOrt",s.absenderOrt)+
     br("Telefon oder Kontakt", "absenderTelefon",s.absenderTelefon)+
     br("Absenderzeile im Fensterbrief", "absenderZeile",s.absenderZeile)+
     br("Ausstellungsort", "ort",s.ort)+
     br("Briefdatum","briefdatum",s.briefdatum,"date")+
     br("Zahlungsziel","zahlungsziel",s.zahlungsziel,"date")+
     br("Kontoverbindung / Fußzeile","bankverbindung",s.bankverbindung, "text",500),true);
   const texts=group("Anrede und Textbausteine",
     br("Persönliche Anrede nur für diesen Brief","personalSalutation",
       s.personalSalutations?.[person.id]||"","text",160)+
     textarea("Einleitung (Variablen {jahr}, {zeitraum})","introText",s.introText)+
     textarea("Zahlungsaufforderung ({betrag}, {zahlungsziel})","saldoTextNachzahlung",
       s.saldoTextNachzahlung)+
     textarea("Text bei Guthaben","saldoTextGuthaben",s.saldoTextGuthaben)+
     textarea("Zusätzliche Erläuterungen (optionale zweite Seite)","outroText",s.outroText)+
     textarea("Schlusstext","abschlusstext",s.abschlusstext)+
     br("Grußformel","gruss",s.gruss)+
     textarea("Signatur","signatur",s.signatur)+
     textarea("Anlagenhinweis","anlagenText",s.anlagenText)+
     textarea("Techem-/Heizkostenhinweis","heizkostenFussnote",s.heizkostenFussnote));
   const mode=s.vorauszahlungPrintMode||"Nicht drucken";
   const extra=group("Vorauszahlungsanpassung (optionale Seite)",
     '<div class="form-row"><label>Zusatzblatt drucken<select name="vorauszahlungPrintMode">'+
      ['Nicht drucken','Manuelle Werte drucken','Berechnete Werte drucken'].map(v=>
        '<option value="'+esc(v)+'"'+(v===mode?' selected':'')+
          (v==='Berechnete Werte drucken'?' disabled':'')+'>'+esc(v)+
          (v==='Berechnete Werte drucken'?' (Berechnungsmodul noch nicht migriert)':'')+'</option>').join('')+
     '</select></label></div>'+
     br("Gültig ab","vorauszahlungAb",s.vorauszahlungAb)+
     textarea("Einleitung zur Anpassung","vorauszahlungIntro",s.vorauszahlungIntro)+
     textarea("Dauerauftragshinweis","dauerauftragText",s.dauerauftragText)+
     '<p class="form-help">Nur geprüfte, ausdrücklich eingetragene Monatsbeträge werden gedruckt. Eine automatische Neuberechnung nach Kostenarten ist noch nicht freigegeben.</p>'+
     '<div class="letter-prepay-head"><strong>Kostenart</strong><span>Alt / Neu monatlich</span></div>'+prepaid);
   return '<form id="letterConfigForm" class="letter-config-form" data-case-id="'+esc(person.id)+'">'+
     delivery+texts+extra+
     '<div class="letter-config-save"><button type="submit" class="button button-primary"'+
       (locked?' disabled':'')+'>Änderungen speichern</button>'+
     (locked?'<p class="form-help">Historischer Musterstand: Einstellungen sind schreibgeschützt.</p>':
       '<p class="form-help">Änderungen betreffen nur das gewählte Abrechnungsjahr. Person und Wohnung werden ausschließlich unter Stammdaten gepflegt.</p>')+
     '</div></form>';
 }
 function render({data,ledger,ui,engine,annualLocked=false}){
   if(!data||!ledger||!engine)return '<p>Briefdaten nicht verfügbar.</p>';
   const packets=engine.renderAll(data,ledger);
   const selected=packets.find(p=>p.id===ui.letterId)||packets[0];
   if(!selected)return '<section class="empty"><h3>Keine Abrechnungsfälle</h3></section>';
   const person=data.tenancies.find(t=>t.id===selected.id);
   const settings=selected.settings;
   const zoom=Number.isFinite(ui.letterZoom)?ui.letterZoom:0.66;
   const controls=(action,label,extra="")=>
     '<button class="button button-quiet letter-tool" type="button" data-action="'+action+'" '+extra+'>'+label+'</button>';
   const recipients=packets.map(p=>{
     const t=data.tenancies.find(x=>x.id===p.id)||{},u=data.units.find(x=>x.id===t.unitId);
     const status=p.preflight.errors?'Unvollständig':p.preflight.warnings?'Prüfen':'Vollständig';
     return '<button type="button" data-action="select-letter" data-id="'+esc(p.id)+
       '" class="letter-recipient'+(p.id===selected.id?' selected':'')+'">'+
       '<strong>'+esc(t.name||p.id)+'</strong><small>'+esc(u?.label||t.unitId||"")+'</small>'+
       '<span class="letter-recipient-status '+(p.preflight.errors?'is-error':p.preflight.warnings?'is-warn':'is-ok')+'">'+status+'</span></button>';
   }).join('');
   const preflight=selected.preflight;
   const checkRows=preflight.issues.map(i=>
     '<li class="'+(i.level==='error'?'is-error':'is-warn')+'">'+esc(i.message)+'</li>').join('');
   const message=preflight.errors?
     '<strong>'+preflight.errors+' fehlende Pflichtangaben</strong> – Druck zunächst nur als gekennzeichneter Musterentwurf möglich.':
     (preflight.warnings?'<strong>'+preflight.warnings+' Prüfhinweise</strong> – Ausdruck ist weiterhin nur synthetischer Musterdruck.':
       '<strong>Briefdaten formal erfasst.</strong> Keine produktive Freigabe.');
   return '<div class="page-heading"><div><div class="eyebrow">ABRECHNUNG '+esc(data.period)+
     ' · ORIGINAL-DOKUMENT NK-PRO 1.0</div><h1>Briefe</h1>'+
     '<p>Originales DIN-A4-Dokumentmodell mit neunspaltiger Tabelle. Die Bedienung ist in einer eigenen Arbeitsfläche vereinfacht. Nur synthetische Musterdaten.</p></div></div>'+
     '<div class="letter-workspace">'+
     '<aside class="letter-list-panel"><div class="letter-panel-heading"><h2>Empfänger</h2><small>'+
       packets.length+' Abrechnungsfälle</small></div><div class="letter-recipient-scroll">'+
       recipients+'</div><div class="letter-panel-note">Empfängeranschriften stammen aus dem Mietverhältnis. Änderungen nur unter Stammdaten.</div></aside>'+
     '<section class="letter-preview-panel"><div class="letter-preview-tools">'+
       controls('letter-fit-page','Ganze Seite')+
       controls('letter-fit-width','Seitenbreite')+
       controls('letter-zoom-out','−','aria-label="Vorschau verkleinern"')+
       '<output aria-label="Zoom" class="letter-zoom-label">'+Math.round(zoom*100)+' %</output>'+
       controls('letter-zoom-in','+','aria-label="Vorschau vergrößern"')+
       controls('letter-toggle-mono',settings.schwarzweissOptimiert==='Ja'?'Schwarzweiß ✓':'Schwarzweiß')+
       '</div>'+
       '<div class="letter-preview-viewport" id="legacyLetterViewport">'+
         '<div class="letter-preview-stage" id="legacyLetterStage" style="--letter-scale:'+zoom+
           ';--letter-pages:'+selected.pageCount+'">'+
           '<div class="letter-preview-canvas" id="legacyLetterCanvas">'+selected.html+'</div></div>'+
       '</div>'+
       '<div class="letter-output-bar">'+
       controls('letter-copy','Brieftext kopieren')+
       controls('letter-print-check','Druck prüfen')+
       controls('letter-internal-overview','Vermieter · Objektübersicht')+
       controls('letter-internal-unit','Vermieter · Wohnungsblatt')+
       controls('letter-internal-all','Vermieter · Alle Blätter')+
       controls('letter-print-all','Alle Briefe / PDF')+
       '<button type="button" class="button button-primary" data-action="letter-print">Drucken / PDF</button>'+
       '</div><div class="letter-preflight"><div class="letter-preflight-summary">'+message+'</div>'+
         (checkRows?'<ul>'+checkRows+'</ul>':'')+
       '<p>DIN A4, Skalierung 100 %, Browser-Kopf-/Fußzeilen deaktivieren. Ausgabe trägt einen sichtbaren Mustervermerk. Kein rechtsverbindlicher Versand.</p></div>'+
       '</section>'+
     '<aside class="letter-settings-panel"><div class="letter-panel-heading"><h2>Briefgestaltung</h2>'+
       '<small>Jahresbezogene Einstellungen</small></div>'+
       form(data,settings,person,annualLocked)+'</aside>'+
     '</div>';
 }
 return{render,version:"letter-workspace-0.13-v1"};
});
