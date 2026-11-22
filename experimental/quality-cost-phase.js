"use strict";
/**
 * NK-Pro 2.0: first three critical cost/person-quality checks.
 * Pure, synthetic-only V99.4.86 parity subset; no persistent/production effects.
 * Semantics mirror evaluateFactual/evaluateCosts for NKP-FACH-008/009/010.
 * The original treats 0, missing and nonnumeric costs as zero.
 */
const text=value=>String(value??"").trim();
const legacyNumber=value=>{
  const n=Number(String(value??"").replace(",","."));
  return Number.isFinite(n)?n:0;
};
const ids=Object.freeze(["NKP-FACH-008","NKP-FACH-009","NKP-FACH-010"]);
function evaluate(input){
  if(!input || input.fixtureKind!=="synthetic" || !Array.isArray(input.costs) ||
     !Array.isArray(input.tenants))
    throw new TypeError("Synthetic-only cost-quality subset requires costs and tenants");
  const active=input.costs.filter(cost=>cost&&text(cost.name)&&cost.enabled===true);
  const personRequired=active.some(cost=>/person/i.test(text(cost.basis)));
  const missingPersons=personRequired ? input.tenants.filter(t=>legacyNumber(t&&t.people)<=0) : [];
  const missingCosts=active.filter(cost=>legacyNumber(cost.amount)<=0);
  return [
    {
      id:"NKP-FACH-008",
      status:!personRequired?"not-applicable":missingPersons.length?"critical":"passed",
      findings:missingPersons.map(t=>({code:"PERSON_COUNT_MISSING",id:text(t&&t.id),field:"tenants.people"})),
      summary:!personRequired?"Keine Kostenart verwendet einen Personenschlüssel.":
        missingPersons.length?missingPersons.length+" Personenzahl(en) fehlen oder sind 0.":
        "Personenzahlen für alle Abrechnungsteilnehmer vorhanden."
    },
    {
      id:"NKP-FACH-009",
      status:active.length?"passed":"critical",
      findings:active.length?[]:[{code:"NO_ACTIVE_COSTS",field:"costs"}],
      summary:active.length?active.length+" aktive NK-Kostenart(en).":"Keine aktive NK-Kostenart vorhanden."
    },
    {
      id:"NKP-FACH-010",
      status:missingCosts.length?"critical":"passed",
      findings:missingCosts.map(c=>({code:"COST_AMOUNT_MISSING",id:text(c.id),field:"costs.amount"})),
      summary:missingCosts.length?missingCosts.length+" aktive Kostenart(en) ohne positiven Gesamtbetrag.":
        "Alle aktiven Kostenarten haben einen positiven Gesamtbetrag."
    }
  ];
}
module.exports=Object.freeze({ids,evaluate,version:"synthetic-cost-quality-1"});
