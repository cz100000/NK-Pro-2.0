# NK-Pro 2.0 · Datenmigration – Bestandsprüfung und Schema-5-Preflight
Datum: 22.11.2026 · **Nur Code, Strukturdiagnostik und synthetische Tests; KEINE Echtdaten im Repository.**

## Entscheidung und Sicherheitsgrenze
NK-Pro 1.0 ist **nur** fachliche und Datenreferenz und wird niemals verändert. NK-Pro 2.0 erhält eine eigene Domäne; es wird **kein** Programmcode aus 1.0 migriert. Ein in-memory Schema-5-Preflight ist keine produktive Migration. Die Testoberfläche, die Beispielobjekte und der vorhandene lokale Speicher bleiben unverändert. Es wird kein Echtbestand mit SYN-/Musterobjekten vermischt.

Die öffentliche GitHub-Pages-Demo ist **keine** Echtdatenumgebung. GitHub-Pages-Unterpfade /NK-Pro/ und /NK-Pro-2.0/ teilen eine Origin und deshalb Browser-Speicher. Produktivdaten benötigen einen davon getrennten, zugriffsgeschützten Host mit eigenem Ursprung, Backup/Restore, Authentisierung und Tests. Die Pages-Allowlist veröffentlicht weiterhin nur Demoassets; das Migrationsmodul, CLI, dieses Dokument und die Tests sind nicht im veröffentlichten Artefakt.

## Verifizierter Ausgangsstand
- NK-Pro 2.0: Branch main, Commit 491914ff (22.11.2026); **Fachtest 0.13**, statische synthetische Demo.
- NK-Pro 1.0: Referenz-Repository, nur lesend verwendet.
- Die Browser-Oberfläche nutzt das synthetische Portfolio-Modell (fixture:true; separater localStorage-Schlüssel). Sie kann keine reale NK-Abrechnung rechtsverbindlich fertigstellen.
- Briefmodul: direkte Ableitungen des ursprünglichen Renderers in legacy-letter-engine.js und legacy-landlord-documents.js. Dies ist eine **bekannte Architekturabweichung**. Der bereits akzeptierte A4-Look darf bei eigenständiger Ersatzimplementierung nicht verloren gehen. Aktuelle Quellidentitäts-Tests ersetzen weder visuellen PDF-Golden-Master-Vergleich noch neue Implementierung.

## Zwei in der Projektbibliothek identifizierte Legacy-JSON-Quellen
Dateibasen sind nur zur Auswahlhilfe genannt; **keine** JSON-Quelle ist in Git eingecheckt.

| Quelle | Arbeitsstand im JSON | Bearbeitet/Exportiert | Aktueller Abrechnungszeitraum | Umfang des aktuellen Jahres | Canonical Meter Master | Archive |
| --- | --- | --- | --- | --- | --- | --- |
| nk-pro-gesamtbestand-2023-V99.4.70-migriert-2026-08-13 | migriert V99.4.70 (internes exportedWith V99.4.67) | Exportmetadaten 02.08.2026; Dateiname 13.08.2026 | **2023**, nicht 2025 | 7 Wohnungen, 20 Jahres-Mieterzeilen, 42 Kostenpositionen, 37 Vorauszahlungszeilen | 16 Zähler, 32 Messwerte, 16 Messperioden | 2024, 2023, 2022, 2021/2022 |
| nk-pro-gesamtbestand-2025-V99.4.65-2026-07-21 | V99.4.65 | 21.07.2026 | **2025**, aber älter | 7 Wohnungen, 5 Jahres-Mieterzeilen, 41 Kostenpositionen, 36 Vorauszahlungszeilen | 44 Zähler, 775 Messwerte, 10 Messperioden | 2024, 2023, 2022, 2021/2022 |

**Wichtige Befunde:**
1. **Keine Datei erfüllt allein den Anspruch „letzter vollständig korrigierter 2025-Gesamtbestand“.** Die 2025-Quelle ist älter als die 2023-Quelle und enthält vor den nachfolgenden Korrekturen liegende Zähler-/Teilnehmerstände. Keinen Stand auf Verdacht als finale 2025-Quelle einsetzen; keine stillschweigende Zusammenführung.
2. In beiden Quellen sind die *jährlichen/älteren* Felder wohnungen[].wohnflaeche anders als die aktuelleren kanonischen Angaben in stammdaten.wohnungen / objektStandard.einheiten. Die Jahreswerte dürfen weder ungeprüft als moderne Stammdaten gesetzt noch unbemerkt in bereits archivierten Abrechnungen umgeschrieben werden.
3. Die jüngere V99.4.70-Quelle enthält den korrigierten Privatteilnehmer-Einzug und die bereinigte kanonische Zählerregistrierung, aber **kein laufendes Abrechnungsjahr 2025**.
4. Die vier vorhandenen Archivstände sind als legacy-partial / historical-not-fully-reconstructable gekennzeichnet. Die Original-Snapshots müssen unverändert bewahrt und ihre fachlichen Einschränkungen dokumentiert werden.
5. Beide sind rohe JSON-Exporte ohne im Dokument geprüfte Backup-Envelope-Prüfsumme. Herkunft und Integrität müssen vor einem wirksamen Import verifiziert werden.
6. Der Kostenkatalog besitzt stabile K-IDs; die Quelle enthält fachliche VZ-Zuordnungen, Techem-Einzelwerte und periodisierte Zählerstrukturen, die das aktuelle synthetische Zielmodell noch nicht vollständig tragen kann.

## Systematischer Feldabgleich
Die maschinenlesbare Datei contracts/schema5-target-map.json enthält **31 Feldgruppen** mit alternativen Quellpfaden, Zielpfad, Umsetzungsstatus und fachlichen Regeln. Sie dokumentiert die Herkunft aller **20 bekannten Root-Sektionen** und weitergehender kanonischer Pfade. Der Zielpfad bezeichnet eine geplante NK-Pro-2.0-Domäne; er **behauptet nicht**, dass die Speicherung oder Bearbeitung bereits implementiert ist.

| Fachbereich | Maßgebliche Legacy-Quellen | Aktueller NK-Pro-2.0-Stand | Ergebnis / nächste Voraussetzung |
| --- | --- | --- | --- |
| Objekt, Gebäude, Eigentum | objektStandard.objekt / gebaeude / eigentuemer | synthetischer Objektstamm, teilweise UI | produktive Master-Struktur und stabile Ursprungs-IDs fehlen |
| Wohnungen/Flächen | objektStandard.einheiten; stammdaten.wohnungen; jährliches wohnungen[] | synthetische units[] | konfliktfähige Vorrangregeln + unveränderliche historische Werte nötig |
| Personen/Mietverhältnisse | objektStandard.partner / vertraege; stammdaten.mieter; jährliches mieter[] | synthetische tenancies[] / Jahresfälle | historische Zeitachsen, Rollen, unterjährige Änderungen, Adressen fehlen |
| Kostenkatalog/Umlageschlüssel | objektStandard.kostenarten; kostenarten; umlageInputs | K-Katalog + Demo-Kosten | komplette Zuordnung, Ausschlüsse, Techem, Korrekturen fehlen |
| Vorauszahlungen | vorauszahlungen / objektStandard.vorauszahlungen | Jahres-Ist-Summe und Soll-Vorschau | kostenartbezogenes Soll/Ist und Zahlungshistorie fehlen |
| Zähler/Verbrauch | zaehlerDaten.*; waterMeterHistory; waterMeters; meterReadings | Musterzähler, Demo-Verbrauch | Messperioden, Wechsel, Belege, echte Id-Verknüpfung fehlen |
| Jahresergebnisse/Prüfungen | kostenartenMieterUmlage; abrechnungsEinzelwerte; abrechnungsPruefungen | synthetische Ergebnis-Matrix | 44 Qualitätsregeln, Unterschriften/Entscheidungen, Centparität offen |
| Historische Abrechnungen | jahresArchiv[].data / summary / immutable | historische Musterjahre | vollständige Revisions-/Archivdomäne fehlt |
| Briefe | briefSettings; briefAddresses | A4-Demo via abgeleitete Legacy-Renderer | unabhängiger Renderer + PDF-Pixelvergleich fehlt |
| Finanzen/Steuern | Quellbelege und separate Vermieter-/Privatanteile | nicht produktiv | eigene finanz-/steuerliche Auswertung erst nach Basisdaten |

**Wichtig:** Privat-/Eigennutzung ist eine **steuerliche Klassifikation**, kein automatischer Ausschluss aus der Nebenkostenumlage. Die alten K002/K003-Beträge werden nicht künstlich getrennt. Die vermieterseitige Techem-Sammelposition darf nicht auf Wohnung/Mieter/Privatanteil verteilt werden.

## Jetzt technisch umgesetzt: unabhängiger, sicherer Vorprüfer
- migration/schema5-preflight.cjs: reiner Node-Code, **nur lesen**, ohne Browser/Persistenz/Netzwerk. Nutzt den bereits eigenständig entwickelten JSON-/Envelope-Inspektor; kopiert keine Legacy-Funktionen.
- Erfasst das Quellformat, Schema 5, SHA-256-Fingerprint, benötigtes Jahr und nur anonyme Mengen/Strukturmerkmale.
- Meldet Konflikte zwischen Stamm- und Jahresflächen, fehlende Jahre, IDs/Referenzen, Datumsfehler, Kostenbeträge nicht centgenau, fehlerhafte Zählerverknüpfungen, Teilarchive, nicht zuordenbare Vorauszahlungen und unerwartete Quellsektionen.
- Bei vorliegenden signierten Envelopes wird die Integrität vor der Feldanalyse geprüft; rohe Exporte werden als nicht kryptografisch verifiziert markiert.
- Bericht zeigt **keine** Namen, Anschriften, Kontaktdaten, Wasser-/Kosten-Einzelwerte oder Rechnungsbeträge.
- Das Ergebnis kann ausdrücklich **keinen Import freigeben** (migrationPermitted:false). Eine spätere schreibende Importtransaktion mit Preview, validiertem Zielmodell, Sicherung, Idempotenz, Rollback und echter Origin-Trennung ist erst noch zu entwickeln.
- scripts/schema5-preflight.cjs ist ein **lokaler Offline-Einstieg**, kein Upload. Beispiel: node scripts/schema5-preflight.cjs /privater/pfad/gesamtbestand.json. Niemals mit realen Dateien in CI/GitHub Actions ausführen.
- tests/schema5-preflight.test.cjs verwendet ausschließlich künstliche Daten und testet Datenschutz, Checksummen, Datenkonflikte, Archivschutz und Fehlerszenarien.
- .gitignore erschwert eine unbeabsichtigte Aufnahme typischer lokaler Echter-Datenablagen.

## Entscheidungspunkte und nächster Entwicklungsschritt
1. Neuesten **korrigierten vollständigen 2025-JSON-Gesamtbestand** bereitstellen; Version, Datum, Archiv-/Current-Scope und Datenherkunft mit dieser Inventur vergleichen.
2. In sicherer, **nicht-öffentlicher** Entwicklungsumgebung einen echten Dry-Run durchführen (ohne produktive Anwendung zu überschreiben). Konflikte fachlich entscheiden; keine Placeholderflächen, keine fiktiven Zahlungswerte.
3. Ein einziges eigenständiges persistentes 2.0-Zielmodell einschließlich Jahres-Snapshots, kostenartspezifischer Vorauszahlungen, Messperioden, Techem, Korrekturen, Archiv und Dokumente vervollständigen.
4. Erst danach schreibenden, transaktionalen Import für abgenommene Daten auf privater Origin mit Vorab-Backup, Integritätsprüfung, Rücksetzen und Duplikatvermeidung integrieren.
5. 2025 Mieter-/Kosten-/Zähler-/Techem-Ergebnisse gegen NK-Pro 1.0 auf Cent-Ebene vergleichen; anschließend eigenständigen Dokumentgenerator gegen freigegebene A4-PDF-Referenzen pixel-/seitenweise abnehmen.
6. Solange offene Punkte bestehen: **keine produktive Freigabe**, keine echten Mieterbriefe, keine Echtdaten in GitHub Pages.
