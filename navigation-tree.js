/* Canonical NK-Pro 2.0 navigation renderer: original v0.13 markup for both data modes.
 * A data-independent UI contract; no mutation, cloud writes or calculations here. */
(function(root,factory){"use strict";const api=Object.freeze(factory());
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
 else root.NKPRO2_NAVIGATION=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){"use strict";
  const icons = {
    overview:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
    bill:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    building:'<path d="M4 21V5l8-2v18M12 9h8v12M7 9h2M7 13h2M15 13h2M15 17h2"/>',
    chart:'<path d="M4 20V12M10 20V5M16 20V9M22 20V2M2 20h21"/>',
    folder:'<path d="M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    reset:'<path d="M3 11a9 9 0 1 1 3 7M3 4v7h7"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    close:'<path d="m5 5 14 14M19 5 5 19"/>',
    chevron:'<path d="m9 5 7 7-7 7"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 10v6M12 7v.4"/>',
    alert:'<path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5M12 17v1"/>',
    arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    save:'<path d="M4 3h14l3 3v15H3V3h1ZM7 3v6h10V3M7 21v-9h10v9"/>',
    pencil:'<path d="m4 20 4.5-1 10-10a2 2 0 0 0-3-3l-10 10L4 20Z"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v5M17 3v5M3 10h18"/>',
    layers:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5m-18 5 9 5 9-5"/>',
    print:'<path d="M6 9V3h12v6M6 18H4V9h16v9h-2M6 15h12v6H6z"/>',
    file:'<path d="M6 2h8l5 5v14H6zM14 2v6h5M9 12h7M9 16h7"/>',
    door:'<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M10 11h.01M14 3v18"/>',
    users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1"/>',
    gauge:'<path d="M4 18a9 9 0 1 1 16 0H4Z"/><path d="m12 15 4-6M7 13h.01M12 8h.01M17 13h.01"/>',
    more:'<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
    plus:'<path d="M12 4v16M4 12h16"/>'
  };
  const icon=(name)=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name]||icons.info}</svg>`;
  const safeText=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render(portfolio,ui,options={}){
    const activeObjects=portfolio.objects.filter(o=>o.lifecycle?.status!=="archived");
    return '<div class="tree-heading"><span>OBJEKTBEZOGEN</span><span class="tree-count">'+
      activeObjects.length+'</span></div>'+
      activeObjects.map(o=>{
        const expanded=o.id===ui.treeOpenObjectId;
        const related=o.id===portfolio.selectedObjectId &&
          (ui.view==='object'||(ui.view==='billing'&&(!ui.billingHome||ui.objectListFilter===o.id)));
        const years=Object.keys(o.settlements).sort((a,b)=>b.localeCompare(a));
        const item=(label,action,id,count,selected,ico)=>'<button type="button" class="tree-subitem'+
          (selected?' selected':'')+'" data-action="'+action+'" data-id="'+safeText(id)+
          '"'+(selected?' aria-current="page"':'')+'><span class="tree-icon">'+icon(ico)+'</span>'+safeText(label)+
          (count!=null?'<span class="tree-meta">'+count+'</span>':'')+'</button>';
        const group=(id,label,count,children)=>{
          const open=ui.treeSections[id];
          const years=id==='years';
          return '<div class="tree-section"><button type="button" class="tree-group-toggle'+
            (years&&related&&ui.view==='billing'&&ui.billingHome?' selected':'')+'"'+
            ' data-action="'+(years?'object-billings':'toggle-tree-section')+
            '" data-id="'+(years?safeText(o.id):id)+'" aria-expanded="'+open+'">'+
            '<span class="tree-arrow'+(open?' open':'')+'" aria-hidden="true">'+icon('chevron')+'</span>'+
            '<span class="tree-icon">'+icon(id==='master'?'layers':'calendar')+'</span>'+
            '<span class="tree-group-label">'+label+'</span>'+
            (count!=null?'<span class="tree-meta">'+count+'</span>':'')+'</button>'+
            (open?'<div class="tree-section-children">'+children+'</div>':'')+'</div>';
        };
        const masterItems=item('Objektdaten','open-object-tab','overview',null,
            related&&ui.view==='object'&&ui.objectTab==='overview','building')+
          item('Wohnungen','open-object-tab','units',o.units.length,
            related&&ui.view==='object'&&ui.objectTab==='units','door')+
          item('Mietverhältnisse','open-object-tab','tenancies',o.tenancies.length,
            related&&ui.view==='object'&&ui.objectTab==='tenancies','users')+
          item('Zähler','open-object-tab','meters',o.meterRegistry.length,
            related&&ui.view==='object'&&ui.objectTab==='meters','gauge');
        const yearItems=years.map(year=>{
            const a=o.settlements[year];
            const selected=related&&ui.view==='billing'&&!ui.billingHome&&
              portfolio.selectedYear===year;
            return '<button type="button" class="tree-year'+(selected?' selected':'')+
              '" data-action="open-year" data-id="'+safeText(o.id)+'|'+year+'"'+
              (selected?' aria-current="page"':'')+'>'+
              '<span class="tree-year-name"><span class="tree-icon">'+icon('calendar')+'</span>'+
              safeText(year)+'</span><small>'+safeText(a.navigationLabel ?? (a.settlement?.status==='draft'?'In Bearbeitung':'Musterstand'))+
              '</small></button>';
          }).join('');
        return '<div class="tree-property'+(expanded?' expanded':'')+'">'+
          '<button class="tree-property-button'+(related?' is-current':'')+
            '" type="button" aria-expanded="'+expanded+'"'+
            (related?' aria-current="location"':'')+
            ' aria-label="'+safeText(o.name)+' öffnen" data-action="select-property" data-id="'+
            safeText(o.id)+'"><span class="tree-arrow'+(expanded?' open':'')+'" aria-hidden="true">'+
            icon('chevron')+'</span><span class="tree-icon">'+icon('building')+
            '</span><span class="tree-property-label">'+safeText(o.name)+
            '</span><span class="tree-units">'+(o.sourceKind==='locked'?'– WE':o.units.length+' WE')+'</span></button>'+
          (expanded?'<div class="tree-children">'+
            group('master','Stammdaten',null,masterItems)+
            group('years','Jahresabrechnungen',years.length,yearItems)+
            '</div>':'')+'</div>';
      }).join('')+
      (options.mode==='real'?'<p class="tree-footnote">Objekt ARB5: Echtdaten · B und C: Musterobjekte.</p>':'<p class="tree-footnote">Ausschließlich fiktive Musterobjekte.</p>');
  }
  return Object.freeze({icon,render});
});
