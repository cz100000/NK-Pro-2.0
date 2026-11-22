"use strict";

/*
 * NK-Pro 2.0: independent, read-only Schema-5 intake preflight.
 * No persistence, browser code, import execution, network I/O or real fixtures.
 * Output intentionally contains counts/codes/index paths only, never tenant data.
 */
const crypto = require("node:crypto");
const inspector = require("../experimental/legacy-backup-inspector.js");
const fieldMap = require("../contracts/schema5-target-map.json");

const plain = value => value !== null && typeof value === "object" && !Array.isArray(value);
const list = value => Array.isArray(value) ? value : [];
const name = value => typeof value === "string" ? value.trim() : "";
const amount = value => typeof value === "number" && Number.isFinite(value) &&
  Number.isSafeInteger(Math.round(value * 100)) &&
  Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;
const date = value => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + "T00:00:00Z");
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};
const at = (source, path) => path.split(".").reduce((v, k) => v == null ? undefined : v[k], source);
const fingerprint = source => crypto.createHash("sha256").update(JSON.stringify(source)).digest("hex");

function preflight(source, options = {}) {
  const requiredYear = options.requiredYear === undefined ? "2025" : String(options.requiredYear);
  const examined = inspector.inspect(source);
  const issues = [];
  const add = (code, severity, path, count = 1) => issues.push({code, severity, path, count});
  const result = {
    contractVersion: "nkpro2.schema5.preflight.v1",
    readOnly: true,
    migrationPermitted: false,
    publishedData: false,
    source: {
      kind: examined.kind || "unknown", integrity: examined.integrity || "unknown",
      schemaVersion: examined.schemaVersion ?? null, fingerprint: null
    },
    counts: {units: 0, tenants: 0, costs: 0, prepayments: 0, meters: 0,
      readings: 0, meterPeriods: 0, assignments: 0, replacements: 0, archives: 0},
    periods: {current: null, archiveYears: [], requiredYearPresent: false},
    fieldCoverage: [],
    issues,
    blockers: 0,
    reviews: 0
  };
  const finish = () => {
    result.blockers = issues.filter(item => item.severity === "blocker").length;
    result.reviews = issues.filter(item => item.severity === "review").length;
    return result;
  };
  if (!examined.ok) {
    for (const code of examined.errors || ["UNREADABLE_SOURCE"]) add("INSPECT_" + code, "blocker", "source");
    return finish();
  }
  if (examined.schemaVersion !== 5) add("UNSUPPORTED_SCHEMA", "blocker", "meta.dataSchemaVersion");
  if (examined.integrity !== "verified") add("SOURCE_INTEGRITY_NOT_VERIFIED", "review", "source");
  const root = examined.kind === "legacy-envelope" ? source.data : source;
  result.source.fingerprint = fingerprint(source);
  result.source.schemaVersion = examined.schemaVersion;
  result.periods.current = name(root.meta?.abrechnungsjahr) || null;

  for (const field of fieldMap.fields) {
    const present = field.from.some(path => at(root, path) !== undefined);
    result.fieldCoverage.push({id: field.id, present, target: field.to,
      targetStatus: field.targetStatus});
    if (!present && field.required) add("MISSING_REQUIRED_FIELD", "blocker", field.from[0]);
  }
  const knownRoot = new Set(fieldMap.knownRootFields);
  for (const key of Object.keys(root)) {
    if (!knownRoot.has(key)) add("UNMAPPED_SOURCE_SECTION", "review", key);
  }
  const masters = list(root.stammdaten?.wohnungen);
  const canonical = list(root.objektStandard?.einheiten);
  const billing = list(root.wohnungen);
  const units = canonical.length ? canonical : masters;
  const tenants = list(root.stammdaten?.mieter);
  const costs = list(root.kostenarten);
  const advances = list(root.vorauszahlungen);
  const meters = list(root.zaehlerDaten?.zaehler);
  const readings = list(root.zaehlerDaten?.messwerte);
  const meterPeriods = list(root.zaehlerDaten?.messperioden);
  const assignments = list(root.zaehlerDaten?.zuordnungen);
  const replacements = list(root.zaehlerDaten?.zaehlerwechsel);
  const archives = list(root.jahresArchiv);
  Object.assign(result.counts, {
    units: units.length, tenants: tenants.length, costs: costs.length,
    prepayments: advances.length, meters: meters.length, readings: readings.length,
    meterPeriods: meterPeriods.length, assignments: assignments.length,
    replacements: replacements.length, archives: archives.length
  });

  if (!canonical.length || !masters.length)
    add("CANONICAL_MASTER_LAYER_INCOMPLETE", "blocker", "objektStandard.einheiten / stammdaten.wohnungen");
  const unitIds = new Set();
  units.forEach((u, i) => {
    const path = "objektStandard.einheiten[" + i + "]";
    const id = name(u?.id || u?.einheitId);
    if (!id || unitIds.has(id)) add("UNIT_ID_MISSING_OR_DUPLICATE", "blocker", path + ".id");
    if (id) unitIds.add(id);
    if (typeof u?.wohnflaeche !== "number" || !(u.wohnflaeche > 0))
      add("MASTER_AREA_INVALID", "blocker", path + ".wohnflaeche");
  });
  const compareUnits = (left, right, label, severity) => {
    const index = new Map(right.map(u => [name(u?.id || u?.einheitId), u]));
    left.forEach((u, i) => {
      const id = name(u?.id || u?.einheitId);
      const other = index.get(id);
      if (!id || !other) add("MASTER_UNIT_ID_DIFFERENCE", "blocker", label + "[" + i + "].id");
      else if (Number(u.wohnflaeche) !== Number(other.wohnflaeche))
        add("UNIT_AREA_SOURCE_CONFLICT", severity, label + "[" + i + "].wohnflaeche");
    });
    if (right.length !== left.length) add("UNIT_SET_SIZE_DIFFERENCE", "blocker", label);
  };
  if (canonical.length && masters.length)
    compareUnits(canonical, masters, "stammdaten.wohnungen", "blocker");
  if (units.length && billing.length)
    compareUnits(units, billing, "wohnungen", "review");

  const tenantIds = new Set();
  tenants.forEach((t, i) => {
    const path = "stammdaten.mieter[" + i + "]";
    const id = name(t?.id), unitId = name(t?.wohnung || t?.einheitId);
    if (!id || tenantIds.has(id)) add("TENANCY_ID_MISSING_OR_DUPLICATE", "blocker", path + ".id");
    if (id) tenantIds.add(id);
    if (!unitIds.has(unitId)) add("TENANCY_UNIT_MISSING", "blocker", path + ".wohnung");
    const start = name(t?.einzug || t?.beginn), end = name(t?.auszug || t?.ende);
    if (!date(start)) add("TENANCY_START_INVALID", "blocker", path + ".einzug");
    if (end && !date(end)) add("TENANCY_END_INVALID", "blocker", path + ".auszug");
    if (date(start) && date(end) && start > end)
      add("TENANCY_PERIOD_REVERSED", "blocker", path);
    // Private use is a tax classification only. It is not an allocation exclusion.
    if (id === "M000" && start !== "2010-01-01")
      add("PRIVATE_PARTICIPANT_START_REQUIRES_REVIEW", "blocker", path + ".einzug");
  });
  if (!tenants.length) add("TENANCY_MASTER_MISSING", "blocker", "stammdaten.mieter");

  const seenCosts = new Set();
  const catalog = {K002: "Wasserversorgung", K003: "Entwässerung",
    K006: "Heiz- und Warmwasserkosten", K009: "Müllbeseitigung"};
  costs.forEach((c, i) => {
    const path = "kostenarten[" + i + "]", id = name(c?.id);
    if (!id || seenCosts.has(id)) add("COST_ID_MISSING_OR_DUPLICATE", "blocker", path + ".id");
    if (id) seenCosts.add(id);
    if (!amount(c?.gesamtbetrag)) add("COST_AMOUNT_INVALID", "blocker", path + ".gesamtbetrag");
    if (catalog[id] && name(c?.kostenart) !== catalog[id])
      add("COST_CATALOG_NAME_CONFLICT", "review", path + ".kostenart");
  });
  advances.forEach((entry, i) => {
    const path = "vorauszahlungen[" + i + "]";
    if (!seenCosts.has(name(entry?.kostenId)))
      add("PREPAYMENT_COST_REF_UNRESOLVED", "blocker", path + ".kostenId");
    if (entry?.werte == null) add("PREPAYMENT_ENTRIES_MISSING", "review", path + ".werte");
  });

  const meterIds = new Set();
  meters.forEach((m, i) => {
    const path = "zaehlerDaten.zaehler[" + i + "]";
    const id = name(m?.zaehlerId || m?.meterId || m?.id);
    if (!id || meterIds.has(id)) add("METER_ID_MISSING_OR_DUPLICATE", "blocker", path);
    if (id) meterIds.add(id);
    if (m?.einheitId && !unitIds.has(name(m.einheitId)))
      add("METER_UNIT_REF_UNRESOLVED", "blocker", path + ".einheitId");
    if (name(m?.status).toLowerCase() === "aktiv" && !name(m?.zaehlernummer))
      add("ACTIVE_METER_NUMBER_UNVERIFIED", "review", path + ".zaehlernummer");
  });
  readings.forEach((r, i) => {
    const path = "zaehlerDaten.messwerte[" + i + "]";
    const id = name(r?.zaehlerId || r?.meterId);
    if (id && !meterIds.has(id)) add("READING_METER_REF_UNRESOLVED", "review", path + ".zaehlerId");
    if (r?.wert !== undefined && (typeof r.wert !== "number" || !Number.isFinite(r.wert)))
      add("READING_NONNUMERIC", "blocker", path + ".wert");
  });
  if (!meters.length || !meterPeriods.length)
    add("CANONICAL_METER_HISTORY_INCOMPLETE", "blocker", "zaehlerDaten");
  if (!plain(root.waterMeterHistory)) add("WATER_HISTORY_MISSING", "review", "waterMeterHistory");
  if (!plain(root.umlageInputs)) add("ALLOCATION_INPUTS_MISSING", "blocker", "umlageInputs");

  const archiveYears = new Set();
  archives.forEach((a, i) => {
    const path = "jahresArchiv[" + i + "]", yr = String(a?.year ?? "");
    if (!yr || archiveYears.has(yr)) add("ARCHIVE_YEAR_DUPLICATE_OR_MISSING", "blocker", path + ".year");
    if (yr) archiveYears.add(yr);
    if (a?.immutable !== true) add("ARCHIVE_IMMUTABILITY_UNCONFIRMED", "review", path + ".immutable");
    if (a?.snapshotCompleteness !== "complete")
      add("ARCHIVE_PARTIAL_HISTORICAL_SNAPSHOT", "review", path + ".snapshotCompleteness");
    if (!plain(a?.data)) add("ARCHIVE_DATA_MISSING", "blocker", path + ".data");
  });
  result.periods.archiveYears = [...archiveYears].sort();
  result.periods.requiredYearPresent =
    result.periods.current === requiredYear || archiveYears.has(requiredYear);
  if (requiredYear && !result.periods.requiredYearPresent)
    add("REQUIRED_YEAR_MISSING", "blocker", "meta.abrechnungsjahr / jahresArchiv");

  return finish();
}
module.exports = Object.freeze({preflight, contractVersion: "nkpro2.schema5.preflight.v1"});
