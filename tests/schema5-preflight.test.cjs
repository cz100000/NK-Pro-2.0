"use strict";
const {test} = require("node:test");
const assert = require("node:assert/strict");
const {preflight} = require("../migration/schema5-preflight.cjs");
const {hash} = require("../experimental/legacy-backup-inspector.js");
const fieldMap = require("../contracts/schema5-target-map.json");

function fixture() {
  return {
    meta: {dataSchemaVersion: 5, abrechnungsjahr: "2025", abrechnungsbeginn: "2025-01-01",
      abrechnungsende: "2025-12-31", objektId: "SYN-OBJ"},
    wohnungen: [{id: "SYN-W1", wohnflaeche: 55}],
    mieter: [{id: "M000", wohnung: "SYN-W1", name: "CONFIDENTIAL SENTINEL",
      einzug: "2010-01-01", auszug: "", abrechnungRolle: "Eigentümer/Privat"}],
    kostenarten: [{id: "K002", kostenart: "Wasserversorgung", gesamtbetrag: 120.5,
      berechnungsart: "Verbrauch", umlageschluessel: "Verbrauch"}],
    vorauszahlungen: [{kostenId: "K002", werte: {M000: 120.5}}],
    umlageInputs: {K002: {mode: "Verbrauch"}},
    waterMeters: {settings: {houseWaterTotal: 12}, readings: []},
    meterReadings: {readings: []},
    briefSettings: {},
    jahresArchiv: [{year: "2024", immutable: true, snapshotCompleteness: "complete",
      data: {wohnungen: [], mieter: [], kostenarten: []}}],
    kostenartenMieterUmlage: {},
    abrechnungsEinzelwerte: [],
    objektStandard: {objekt: {id: "SYN-OBJ"}, gebaeude: [{id: "SYN-G1"}],
      einheiten: [{id: "SYN-W1", wohnflaeche: 62.5}],
      vertraege: [{id: "M000"}], kostenarten: [], vorauszahlungen: []},
    zaehlerDaten: {zaehler: [{zaehlerId: "SYN-M1", einheitId: "SYN-W1",
      zaehlernummer: "SYN-001", status: "aktiv"}],
      messwerte: [{zaehlerId: "SYN-M1", wert: 12}],
      messperioden: [{id: "SYN-P1"}], zuordnungen: [], zaehlerwechsel: []},
    stammdaten: {wohnungen: [{id: "SYN-W1", wohnflaeche: 62.5}],
      mieter: [{id: "M000", wohnung: "SYN-W1", name: "CONFIDENTIAL SENTINEL",
        einzug: "2010-01-01", auszug: "", abrechnungRolle: "Eigentümer/Privat"}]},
    waterMeterHistory: {},
    briefAddresses: {},
    abrechnungsPruefungen: {},
    prepaymentAdjustmentSettings: {},
    kostenUmlagenAbgleich: {}
  };
}
const codes = report => report.issues.map(issue => issue.code);

test("public field mapping covers each declared raw Schema-5 root section", () => {
  assert.equal(fieldMap.contractVersion, 1);
  assert.equal(fieldMap.knownRootFields.length, 20);
  assert.equal(new Set(fieldMap.knownRootFields).size, 20);
  assert.ok(fieldMap.fields.length >= 28);
  for (const f of fieldMap.fields) {
    assert.ok(f.from.length && f.to && f.id && f.targetStatus);
    assert.ok(fieldMap.knownRootFields.hasOwnProperty === undefined ||
      f.from.every(path => typeof path === "string"));
  }
});
test("read-only assessment detects year and preserves historical areas without mutating source", () => {
  const state = fixture(), before = JSON.stringify(state), report = preflight(state);
  assert.equal(report.readOnly, true);
  assert.equal(report.migrationPermitted, false);
  assert.equal(report.periods.requiredYearPresent, true);
  assert.equal(report.counts.units, 1);
  assert.equal(report.counts.tenants, 1);
  assert.equal(report.counts.meters, 1);
  assert.equal(report.counts.archives, 1);
  assert.ok(codes(report).includes("UNIT_AREA_SOURCE_CONFLICT"));
  assert.equal(codes(report).includes("PRIVATE_PARTICIPANT_START_REQUIRES_REVIEW"), false);
  assert.equal(JSON.stringify(report).includes("CONFIDENTIAL SENTINEL"), false);
  assert.equal(JSON.stringify(state), before);
});
test("missing required 2025 data is blocked without fabricating a year", () => {
  const state = fixture();
  state.meta.abrechnungsjahr = "2023";
  const result = preflight(state);
  assert.equal(result.periods.requiredYearPresent, false);
  assert.ok(codes(result).includes("REQUIRED_YEAR_MISSING"));
});
test("conflicting current masters and duplicate IDs require manual reconciliation", () => {
  const state = fixture();
  state.stammdaten.wohnungen[0].wohnflaeche = 63;
  state.objektStandard.einheiten.push({...state.objektStandard.einheiten[0]});
  const result = preflight(state);
  assert.ok(codes(result).includes("UNIT_AREA_SOURCE_CONFLICT"));
  assert.ok(codes(result).includes("UNIT_ID_MISSING_OR_DUPLICATE"));
  assert.ok(result.blockers > 0);
});
test("invalid money, missing meter links and orphan prepayment cost are surfaced", () => {
  const state = fixture();
  state.kostenarten[0].gesamtbetrag = 12.345;
  state.zaehlerDaten.messwerte[0].zaehlerId = "UNKNOWN";
  state.vorauszahlungen[0].kostenId = "UNKNOWN";
  const result = preflight(state);
  assert.ok(codes(result).includes("COST_AMOUNT_INVALID"));
  assert.ok(codes(result).includes("READING_METER_REF_UNRESOLVED"));
  assert.ok(codes(result).includes("PREPAYMENT_COST_REF_UNRESOLVED"));
});
test("private-use start date is not automatically rewritten or excluded", () => {
  const state = fixture();
  state.stammdaten.mieter[0].einzug = "2024-01-01";
  const result = preflight(state);
  assert.ok(codes(result).includes("PRIVATE_PARTICIPANT_START_REQUIRES_REVIEW"));
  assert.equal(state.stammdaten.mieter[0].einzug, "2024-01-01");
});
test("partial historical archive is retained and visibly flagged", () => {
  const state = fixture();
  state.jahresArchiv[0].snapshotCompleteness = "historical-not-fully-reconstructable";
  const result = preflight(state);
  assert.ok(codes(result).includes("ARCHIVE_PARTIAL_HISTORICAL_SNAPSHOT"));
  assert.equal(state.jahresArchiv[0].immutable, true);
});
test("signed envelopes are checked before any field inspection", () => {
  const state = fixture();
  const metadata = {backupId: "SYN-001", backupType: "full", createdAt: "2026-11-22T12:00:00Z",
    sourceSchemaVersion: 5, targetSchemaVersion: 5, dataLayerContractVersion: 1,
    migrationPath: [], checksumAlgorithm: "FNV1A32",
    payloadChecksum: hash(JSON.stringify(state))};
  metadata.metadataChecksum = hash(JSON.stringify(metadata));
  const envelope = {format: "nk-pro-backup-envelope", formatVersion: 1,
    metadata, data: state};
  envelope.envelopeChecksum = hash(JSON.stringify(envelope));
  const ok = preflight(envelope);
  assert.equal(ok.source.integrity, "verified");
  assert.equal(codes(ok).includes("SOURCE_INTEGRITY_NOT_VERIFIED"), false);
  envelope.data.kostenarten[0].gesamtbetrag = 500;
  const rejected = preflight(envelope);
  assert.equal(rejected.source.integrity, "failed");
  assert.ok(codes(rejected).some(x => x.includes("CHECKSUM")));
  assert.equal(rejected.counts.units, 0);
});
test("new or unknown source fields never silently disappear", () => {
  const state = fixture();
  state.unmappedFutureSection = {private: "CONFIDENTIAL SENTINEL"};
  const result = preflight(state);
  assert.ok(codes(result).includes("UNMAPPED_SOURCE_SECTION"));
  assert.equal(JSON.stringify(result).includes("CONFIDENTIAL SENTINEL"), false);
});
