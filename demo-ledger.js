/* NK-Pro 2.0 – pure synthetic demonstration ledger.
 * Does NOT implement the legacy NK-Pro settlement rules. Never use to issue real bills.
 * No DOM, network, storage, tenant data, imports or filesystem dependencies.
 */
(function (root, factory) {
  "use strict";
  const api = Object.freeze(factory());
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NKPRO2_DEMO_LEDGER = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const MAX_CENTS = Number.MAX_SAFE_INTEGER;
  function amountToCents(value) {
    if (typeof value === "boolean" || value === "" || value === null || value === undefined) return null;
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0 || n * 100 > MAX_CENTS) return null;
    return Math.round((n + Number.EPSILON) * 100);
  }
  function areaWeight(value) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 && Number.isSafeInteger(Math.round(n * 100))
      ? Math.round(n * 100) : null;
  }
  function waterWeight(start, end) {
    const a = Number(start), b = Number(end);
    return Number.isSafeInteger(a) && Number.isSafeInteger(b) && a >= 0 && b >= a
      ? b - a : null;
  }
  function allocateCents(total, weights) {
    if (!Number.isSafeInteger(total) || total < 0) throw new RangeError("Invalid integer cents");
    if (!weights.every(w => Number.isSafeInteger(w) && w >= 0)) throw new RangeError("Invalid weights");
    const sum = weights.reduce((a, b) => a + BigInt(b), 0n);
    if (sum === 0n) return null;
    const amount = BigInt(total);
    const pieces = weights.map((weight, index) => {
      const numerator = amount * BigInt(weight);
      return { index, base: Number(numerator / sum), remainder: numerator % sum };
    });
    const distributed = pieces.reduce((s, p) => s + p.base, 0);
    const pending = total - distributed;
    pieces.sort((a, b) => a.remainder === b.remainder
      ? a.index - b.index : a.remainder > b.remainder ? -1 : 1);
    for (let i = 0; i < pending; i++) pieces[i].base++;
    pieces.sort((a, b) => a.index - b.index);
    return pieces.map(p => p.base);
  }
  function calculate(input) {
    const state = input && typeof input === "object" ? input : {};
    const costs = Array.isArray(state.costs) ? state.costs : [];
    const units = Array.isArray(state.units) ? state.units : [];
    const issues = [];
    const report = (code, message, action) => issues.push({ code, message, action });
    if (!units.length) report("NO_UNITS", "Keine Wohnungen vorhanden.", "go-review");
    if (!costs.length) report("NO_COSTS", "Keine Kostenarten vorhanden.", "go-costs");
    const ids = new Set();
    const unitRows = units.map((unit, index) => {
      const id = String(unit.id || "");
      if (!id || ids.has(id)) report("DUPLICATE_UNIT", "Wohnungskennungen fehlen oder sind doppelt.", "go-review");
      ids.add(id);
      const area = areaWeight(unit.area), water = waterWeight(unit.waterStart, unit.waterEnd);
      if (area === null) report("INVALID_AREA", "Wohnfläche von " + (id || index) + " ist ungültig.", "go-review");
      if (water === null) report("INVALID_WATER", "Zählerstände von " + (id || index) + " sind ungültig.", "go-water");
      const advance = amountToCents(unit.advance);
      if (advance === null) report("INVALID_ADVANCE", "Vorauszahlung von " + (id || index) + " ist ungültig.", "go-advance");
      return {
        id, label: String(unit.label || id), areaWeight: area, waterWeight: water,
        advanceCents: advance === null ? 0 : advance,
        costCents: 0, balanceCents: 0, entries: []
      };
    });
    let grossCostsCents = 0, allocableCostsCents = 0, landlordCostsCents = 0;
    const costIds = new Set();
    const costRows = costs.map((cost, index) => {
      const id = String(cost.id || "");
      if (!id || costIds.has(id)) report("DUPLICATE_COST", "Kostenartenkennungen fehlen oder sind doppelt.", "go-costs");
      costIds.add(id);
      const amount = amountToCents(cost.amount);
      if (amount === null) report("INVALID_COST", "Gesamtkosten sind bei " + (id || index) + " ungültig.", "go-costs");
      const landlord = amountToCents(cost.landlordShare ?? 0);
      if (landlord === null || (amount !== null && landlord > amount))
        report("INVALID_LANDLORD", "Vermieteranteil ist bei " + (id || index) + " ungültig.", "go-costs");
      const total = amount === null ? 0 : amount;
      const landlordCents = landlord === null || landlord > total ? 0 : landlord;
      const eligible = total - landlordCents;
      grossCostsCents += total;
      landlordCostsCents += landlordCents;
      allocableCostsCents += eligible;
      const method = String(cost.method || "");
      if (!["Fläche", "Verbrauch"].includes(method))
        report("UNKNOWN_METHOD", "Umlagebasis ist bei " + (id || index) + " nicht definiert.", "go-costs");
      const weights = unitRows.map(u => method === "Fläche" ? u.areaWeight : u.waterWeight);
      const inputsValid = weights.every(w => w !== null) && ["Fläche", "Verbrauch"].includes(method)
        && amount !== null && landlord !== null && landlord <= total;
      const sums = weights.filter(x => x !== null).reduce((s, w) => s + w, 0);
      let shares = null;
      if (inputsValid && eligible > 0 && sums === 0)
        report("ZERO_BASIS", "Keine positive Umlagebasis für " + (id || index) + " vorhanden.", method === "Verbrauch" ? "go-water" : "go-costs");
      if (inputsValid && sums > 0) shares = allocateCents(eligible, weights);
      if (eligible === 0 && inputsValid) shares = weights.map(() => 0);
      const rows = unitRows.map((u, i) => {
        const cents = shares ? shares[i] : 0;
        const weight = weights[i];
        u.costCents += cents;
        u.entries.push({ costId: id, name: String(cost.name || id), method, cents, weight, totalWeight: sums });
        return { unitId: u.id, cents, weight, totalWeight: sums };
      });
      return {
        id, name: String(cost.name || id), method, grossCents: total,
        landlordCents, eligibleCents: eligible,
        distributedCents: rows.reduce((s, u) => s + u.cents, 0),
        allocated: shares !== null, rows
      };
    });
    let advancesCents = 0, distributedCents = 0;
    for (const unit of unitRows) {
      unit.balanceCents = unit.costCents - unit.advanceCents;
      advancesCents += unit.advanceCents;
      distributedCents += unit.costCents;
    }
    const balanceCents = unitRows.reduce((s, u) => s + u.balanceCents, 0);
    const differenceCents = allocableCostsCents - distributedCents;
    if (differenceCents !== 0 && !issues.some(x => ["ZERO_BASIS", "INVALID_AREA", "INVALID_WATER", "INVALID_COST", "INVALID_LANDLORD", "UNKNOWN_METHOD"].includes(x.code)))
      report("RECONCILIATION", "Umlage und Gesamtkosten sind nicht vollständig abgeglichen.", "go-review");
    return {
      units: unitRows, costs: costRows, issues,
      totals: { grossCostsCents, allocableCostsCents, landlordCostsCents, advancesCents,
        distributedCents, balanceCents, differenceCents },
      valid: issues.length === 0 && differenceCents === 0
    };
  }
  function fingerprintWater(state) {
    return JSON.stringify([
      state.houseWater,
      state.waterSettings??null,
      (Array.isArray(state.units) ? state.units : []).map(u => [u.id, u.waterStart, u.waterEnd,u.waterMeters??null])
    ]);
  }
  function fingerprintLetter(state) {
    return JSON.stringify([
      state.period,
      (Array.isArray(state.costs) ? state.costs : []).map(c => [c.id, c.name, c.amount, c.landlordShare ?? 0, c.method,c.note??"",c.priceMode??"auto",c.unitPrice??null]),
      (Array.isArray(state.units) ? state.units : []).map(u => [u.id, u.label, u.position, u.area, u.waterStart, u.waterEnd, u.waterMeters??null,u.waterNote??"", u.advance]),
      state.houseWater,state.waterSettings??null
    ]);
  }
  return { calculate, allocateCents, amountToCents, fingerprintWater, fingerprintLetter, version: "demo-ledger-1" };
});
