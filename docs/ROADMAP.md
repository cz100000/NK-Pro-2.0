# Roadmap für NK-Pro 2.0

## Maßgeblicher Entwicklungsplan für Stufen 3–7 (konsolidiertes Feedback 41 Punkte, 22.11.2026)

**Für alle neuen Entwicklungsaufträge ist [ENTWICKLUNGSPLAN_3_BIS_7_FEEDBACK_41_2026-11-22.md](ENTWICKLUNGSPLAN_3_BIS_7_FEEDBACK_41_2026-11-22.md) der verbindliche Arbeitsplan.** Er ordnet sämtliche 41 Nutzeranforderungen einzeln den überarbeiteten Stufen 3 bis 7 zu, mit übergreifenden UX-/Datenregeln, fachlichen Abhängigkeiten und Stufen-Abnahmegates. Frühere Stufenpläne unten dienen als historische Grundlage, nicht als widersprechende Umsetzungspriorität. Stufe 1+2 ist synthetisch angebunden, aber noch nicht fachlich vollständig abgenommen. **Diese Änderung ist Planung, nicht App-Funktionalität; keine produktive Abnahme.**


1. Vollständige Ist-/Soll-Funktionsmatrix der bestehenden Version V99.4.86.
2. Design-/UX-Gate für alle Kernjourneys und die fünf neuen Hauptbereiche.
3. Komponentenbasiertes neues PWA-Fundament mit klaren Schnittstellen.
4. Golden-Master-Tests für Mietverhältnisse, Wasser, Techem, Umlagen, Sonderfälle, Salden, Rundung und Prüfungen.
5. Sichere Datenmigration und getrennte Echtdaten-Origin.
6. Vollständige Briefe, Prüffreigabe und Archivierung.
7. Verbesserte Analysen: Nebenkosten, eigenständige Finanz-/Cashflow-Sicht und Steuerüberleitungen.
8. Externe/eigene Offline- und Cloud-Tests, fachliche Abnahme und kontrollierte Umstellung.

Das alte NK-Pro-Repositorium ist ausdrücklich nicht Teil dieses Deployments und bleibt produktiv nutzbar.

## Funktionsmuster 0.3 (22.11.2026)

- [x] Sechs Original-Umlageverfahren in bestehender synthetischer Browser-Demo eingebunden; Kosten, Personen/Miettage, Wasser, Vorauszahlungen, Restdifferenzen und Detailnachweise durchspielbar.
- [ ] Echte Teilnehmer-/Mietwechsel- und KW-/WW-Domänen; vollständiger Legacy-Abrechnungskern und 44 Qualitätsregeln.
- [ ] Sicherer Import und Speicher mit separater Browser-Origin.
- [ ] Briefe, Druckabnahme, Archiv, Analysen, Drive und kontrollierter Parallelbetrieb.

## Anwenderfeedback vom 22.11.2026 · Wasser und Kostenfreitext

- [x] Zwei getrennte KW-/WW-Kanäle je synthetischer Wohnung; Zählernummer, Datum, Anfang/Ende und optionale Bemerkung.
- [x] Hauszählerstand, Rechnungsverbrauch, beide Abweichungsabgleiche und €/m³-Anzeige; automatische Preisermittlung mit vier Nachkommastellen und manuelle Preisvorgabe im Kostenformular.
- [x] Freitext/Bemerkung zu jeder angelegten Kostenart mit Speicherung im Demo-Datensatz.
- [ ] Vollständige Bestandsparität für physische Zähleridentität, Messperioden, Zählerwechsel, Leerstand, Mieterwechsel und Vorjahresübernahme.
- [ ] 2025-Sonderregel der tatsächlichen Abrechnung mit den bestätigten Originalzählerständen centgenau abnehmen, ehe Echtdaten erlaubt werden.

## Vollständiger Funktionsvergleich 1.0 → 2.0

Die priorisierte, quellcodegestützte Tiefenanalyse ist in [LEGACY_FUNCTION_GAP_AUDIT_2026-11-22.md](LEGACY_FUNCTION_GAP_AUDIT_2026-11-22.md) dokumentiert: einzeln rückverfolgbare Lücken, 5-Bereiche-UX-Ziel, fachliche Paritätsfallen und End-to-End-Abnahmegates. NK-Pro 1.0 bleibt unangetastet.

## Fachtest 0.5 · Stufe 1 + 2 gemeinsam entwickeln (22.11.2026)

- [x] Synthetischer Objekt-/Wohnungsstamm und Mietverhältnisse als getrennte Abrechnungsfälle mit Ein-/Auszug, Privatanteil, Vorauszahlungen und Leerstandsprüfungen.
- [x] Referenzbasierte Umlage auf einzelne Mietverhältnisse; Kosten-Ausnahmen je Fall, eigene Verbräuche und keine stille Verteilung ungeklärter Beträge.
- [x] Kalt-/Warmwasser getrennt; Originalstände mit Nachkommastellen, Hausabgleich, Zählerwechsel und mehrere Messperioden, besondere Rundung 2025 nur bei ausdrücklich bestätigter Evidenz.
- [x] Sichtbare 0.5-UX innerhalb der fünf Hauptbereiche mit Objekt-Unteransichten und Detail-Drawern.
- [ ] Stufe 1+2 fachlich abschließen: alle K-IDs/Kostenarten, historische Miet-/Zählerzuordnungen, kontrollierter Jahreswechsel und Bestandstransfer, sämtliche 2025-Rundungs-/Techem-/Einzelkosten-Sonderfälle mit vollständiger Originalparität.
- [ ] Fachprüfungen, finale Briefe, Archiv, sicherer Echtdatenhost, Import/Backup/Restore und Betriebsfreigabe sind weiter offen.

## Gemeinsame Entwicklung Stufe 3 + Stufe 4 · Fachtest 0.6 (22.11.2026)

- [x] Einheitlicher synthetischer Erfassungs-/Prüfablauf mit den sieben Schritten „Mietverhältnisse → Vorauszahlungen → Gesamtkosten → Verbräuche → Prüfen → Ergebnis → Briefe“.
- [x] Vor-/Nachname, Briefanrede, einzelne Stammdatenfelder; monatliche/jährliche vereinbarte vs. tatsächlich erhaltene Vorauszahlungen und fallbezogene Salden.
- [x] K001–K035-Katalog, eigene Rechnungsdaten und Kostenarten, Aktivierung/Deaktivierung, Belegnotiz, sichere Löschung versehentlich angelegter unbenutzter Musterkosten.
- [x] Techem-Euro-Einzelwerte mit optionalen Einheiten je Mietverhältnis ausschließlich unter Verbräuche; KW/WW mit Live-Summen und datierten Zwischenablesungen für belegbare Leerstandsmengen.
- [x] 44 Originalqualitätsregeln inventarisiert, 25 unabhängige synthetische Teilchecks ausführbar; 19 ausdrücklich nicht ausgeführt; dynamische Fehlermeldungen, schreibgeschützte vorläufige Ergebnisse.
- [x] Fallweise Mieterbrief-Entwürfe mit konfigurierbaren Grundtexten und Einzeldarstellungen; keine Druck-/Abschlussfreigabe.
- [ ] **Noch nicht abgeschlossen:** vollständige 1.0-Rechen-/Katalog- und Techem-Sonderfallparität, 19 nicht portierte Regeln und volle Abnahme der Teilregeln, vollständiger Original-Briefgenerator samt A4-/Sammeldruckpreflight, Abschlussbedingung und fachlicher E2E-Freigabe.

Siehe [STAGES_3_4_INTEGRATED_2026-11-22.md](STAGES_3_4_INTEGRATED_2026-11-22.md). Stufen 3+4 sind **gemeinsam bearbeitet, nicht vollständig fertiggestellt**.
