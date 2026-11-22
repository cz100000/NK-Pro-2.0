"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),
 fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
test("There is exactly one v0.13 tree renderer and one app controller",()=>{
 const app=read("app.js"),cloud=read("integrated-app.js"),nav=read("navigation-tree.js"),
  view=read("portfolio-view-model.js"),html=read("index.html");
 assert.match(app,/navRenderer\.render\(displayPortfolio\(\),ui/);
 assert.match(app,/window\.NKPRO2_INTEGRATED_APP\?\.bootstrap\(\)/);
 assert.doesNotMatch(app,/if\s*\(\s*window\.NKPRO2_INTEGRATED_APP\?\.bootstrap\(\)\s*\)\s*return/);
 assert.match(app,/const viewModel=window\.NKPRO2_PORTFOLIO_VIEW/);
 assert.match(app,/function renderTree\(\)/);
 assert.match(nav,/tree-property-button/);
 assert.match(nav,/tree-group-toggle/);
 assert.match(nav,/tree-subitem/);
 assert.match(nav,/tree-year/);
 assert.match(nav,/const icons\s*=/);
 assert.doesNotMatch(app,/const icons\s*=/);
 assert.doesNotMatch(cloud,/portfolioTree|appMain|nk-live-tree|function render\(/);
 assert.doesNotMatch(cloud,/querySelectorAll\(["']\.nav-item/);
 assert.doesNotMatch(view,/\.innerHTML|querySelector|createElement|appendChild|function render\(/);
 assert.match(html,/\.\/navigation-tree\.js\?v=0\.17/);
 assert.match(html,/\.\/portfolio-view-model\.js\?v=0\.17/);
});
test("No legacy pale real-data tree selectors remain in live CSS or JS",()=>{
 for(const f of ["app.js","integrated-app.js","integrated-ui.css","portfolio-view-model.js"])
  assert.doesNotMatch(read(f),/nk-live-tree|nk-live-page|nk-live-stats|nk-live-card/);
 assert.ok(read("index.html").includes("./styles.css?v=0.13"),
  "The original 0.13 design stylesheet must remain the active source");
});
test("Genuine 2025 is not run through sample billing, while B/C retain original engine",()=>{
 const app=read("app.js"),adapt=read("portfolio-view-model.js");
 assert.match(app,/const annualLocked=\(\)=>selectedReal\?true:estates\.readonly\(data\)/);
 assert.match(app,/if\(selectedReal\)return ui\.billingHome\?realBillingList\(\):realBillingYear\(\)/);
 assert.match(app,/if\(selectedReal&&!new Set/);
 assert.match(adapt,/objects:\[real,b,c\]/);
 assert.match(adapt,/if\(!live&&!options\.locked\)return synthetic/);
 assert.match(adapt,/settlement:\{year:"2025",status:"draft",readOnly:true\}/);
 assert.doesNotMatch(adapt,/caseBilling\.calculate|NKPRO2_SYNTHETIC_BILLING/);
});
test("Cloud controller keeps original encrypted-data key and never overwrites it during mere rendering",()=>{
 const cloud=read("integrated-app.js"),app=read("app.js");
 assert.match(cloud,/nkpro2_live_cloud_encrypted_v1/);
 assert.match(cloud,/getData:\(\)=>state\?JSON\.parse\(JSON\.stringify\(state\)\):null/);
 assert.match(cloud,/nkpro2-private-data-change/);
 assert.match(app,/addEventListener\('nkpro2-private-data-change'/);
 assert.doesNotMatch(app,/setItem\(['"]nkpro2_live_cloud_encrypted_v1/);
});
