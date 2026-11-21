# Fachlicher Paritätsvertrag: NK-Pro V99.4.86 → NK-Pro 2.0

**Stand:** 21.11.2026  
**Quell-Repository:** [cz100000/NK-Pro](https://github.com/cz100000/NK-Pro)  
**Unveränderliche Quell-Referenz:** `a089e1fe660dd5502799560efe2bc4b65a09f278`  
**Status:** nach Quellcode geprüft; noch **kein** ausgeführter Golden-Master-Vergleich.

Die im neuen Repository vorhandene `demo-ledger.js` ist nur eine **synthetische, cent-genaue UX-Demo**. Ihre Logik darf nicht mit der alten Abrechnungslogik verwechselt werden. Die folgenden Punkte sind fachliche Gating-Anforderungen vor jedem realen 2025-Abrechnungseinsatz.

## 1. Gesicherte Legacy-Module und Code-Fingerprints

| Verantwortung | Dateipfad in V99.4.86 | Git-Blob-SHA |
| --- | --- | --- |
| Fachlicher Rechenkern | `js/billing-calculation.js` | `59947f89249457a505deb5eb8c674350b01b9f30` |
| Bearbeitungs-/Archivkontext | `js/billing-context.js` | `5d0c1551c6fc9ac0ccadf0e57f5bdd3d16520aac` |
| Regelkatalog | `js/quality-rules.js` | `75921b3f5800718d56f7dc41f85a8284fae5e937` |
| Briefdaten | `js/document-data.js` | `3df7d1b05696860e658be1e5ede6c163ed26bbab` |
| Abrechnungs-Snapshot | `js/billing-snapshot.js` | `abed90944e66565b58e894b82a866902fff5ab87` |
| Zählerstände | `js/meter-readings.js` | `d9bea4833e26054710568b915f4ecdb80b080567` |
| Drive-Synchronisation | `js/drive-sync.js` | `f51a40486558f16d1587965ad58f70ba2a79b2ad` |

**Die Originaldateien bleiben im Original-Repository.** Die neue App bekommt später nur explizit getestete Adapter und fachliche Portierungen. Echtdaten werden nicht in dieses öffentliche Repository hochgeladen.

## 2. Wichtige Unterschiede zwischen Demo und Original

| Fachfall | Echtes NK-Pro V99.4.86 (Quellcodebefund) | NK-Pro-2.0-Demo | Was vor Produktivbetrieb zu tun ist |
| --- | --- | --- | --- |
| Wohnfläche | `Wohnfläche × Miettage` auf relevanter Personen-/Wohnungsbasis; abhängig von Kostenbehandlung | nur reine m² pro Einheit | zeitbezogene Umlage übernehmen und vergleichen |
| Personen | Personentage; ggf. Personen × Miettage | fehlt | Personenkontext und Perioden einbinden |
| Mieteinheiten | Wohnungen inkl. Leerstands-/Eigentümerrest | fehlt | Wohnungsbestands-Divisor und Leerstand korrekt bewahren |
| Verbrauch | Preis = Gesamtbetrag / Gesamtverbrauch, falls verfügbar; Teilnehmerbetrag gerundet, Rest beim Eigentümer | Restcent-Verteilung des vollen umlagefähigen Gesamtbetrags auf Mustereinheiten | Original-Preis-/Rundungs- und Eigentümerrestlogik einbinden |
| Externe Einzelabrechnung | individuelle Fallwerte, Leerstands- und externe Eigentümeranteile; gesonderte Nachweise | einfacher expliziter Demo-Vermieteranteil | komplette Fall-/Techem-/Dokumentenlogik übernehmen |
| Individuelle Mieterbelegung | unterjährige Ein-/Auszüge, Fallgruppen, Zeitanteile | jede Wohnung hat einen Datensatz | Mietverhältnis als getrennte Einheit vom Wohnungsstamm abbilden |
| Privatanteil | Privatnutzung ist **kein Ausschluss** von Abrechnung; `privateResults` nur abgeleitete Ansicht | keine echten Miet-/Privatrollen | M000/W000.UG regulär abrechnen, Steuer gesondert |
| Vorauszahlungen | kostenarten-/mieterbezogen, Korrekturen, gesonderte Kaltmietkorrekturen | nur Jahreswert je Wohnung | vollständiges Vorauszahlungsmodell migrieren |
| Freigabe | 44 Regeln in `quality-rules.js` plus weitere Prüfungen; Briefe versandbereit | nur wenige Demo-Prüfungen | vollständige Regel- und Briefprüfung anschließen |
| Dokumente | echte Abrechnungsbriefe mit Preflight | Wassermark-Musterbrief | Layout-/Berechnungs-/Empfängerparität prüfen |

**Folgerung:** Auch wenn die Demo in Cent exakt summiert, wird daraus **nicht** automatisch eine rechtlich oder fachlich korrekte NK-Abrechnung. Insbesondere Eigentümerreste und Miettage dürfen nicht mit dem Demo-Verfahren „verbessert“ werden.

## 3. Ziel-Schnittstellen

| Schnittstelle | Erwartete Eingaben | Fachlicher Vertrag |
| --- | --- | --- |
| `loadLegacySnapshot` (zukünftig) | JSON-Export V99.4.86, Schema-Version, Metadaten | keine impliziten Schreibzugriffe, versionierter Import, Prüfbericht |
| `calculateSettlement` (zukünftig) | Abrechnungskontext, Kosten, Mietverhältnisse, Zähler, individuelle Werte | Ergebnis pro Kostenart, Mieter, Eigentümer und Restposition inkl. Begründung |
| `runSettlementChecks` (zukünftig) | aktueller Stand plus Daten-Fingerprints | kritische Mängel vs. prüfbare Entscheidungen vs. Hinweise |
| `prepareLetters` (zukünftig) | geprüfte Mieterergebnisse und Druckeinstellungen | jeder Empfängerbetrag reproduzierbar; Brief-Preflight vor Abschluss |
| `finalizeSnapshot` (zukünftig) | finalisierte Abrechnung, QA, Briefe | unveränderlicher historischer Abschluss; Versand separat |
| `financeTaxViews` (zukünftig) | Kosten-/Zahlungsdaten, Steuerklassifikationen und Nutzungsarten | drei getrennte Perspektiven ohne erfundene Steuer- oder Ist-Zahlungswerte |

Die endgültigen Typsignaturen werden in einer späteren, privat und sicher getesteten Datenadapterphase festgelegt.

## 4. Golden-Master-Tests: Mindestkatalog

- Gesamtkosten, berücksichtigter Eigentümeranteil, nicht umgelegte Restpositionen und alle Salden.
- Jede Kostenart mit sämtlichen real genutzten Umlageschlüsseln.
- Mietwechsel, Leerstand, Privatnutzung und getrennte Steuerklassifikation.
- Wasserzählerrundung 2025, 2024-Endstände und Haus-/Wohnungsverbrauchsdifferenzen.
- Externe Techem-Positionen: 3,88 € ausschließlich Vermieter, nicht dem Privatanteil oder Leerstand zugeordnet.
- K009 Müll 1.503,00 € und Wasser 1.642,31 € (275 m³ Hauszähler) als bekannte 2025-Referenzwerte.
- Berichtigte/akzeptierte Differenzentscheidungen inkl. erneuter Prüfung bei Datenänderung.
- Briefe: Empfänger, Summen, Korrekturen, A4-Seitenumbrüche und Freigabestatus.
- Jahrgangswechsel, schreibgeschützter Archivzustand, Backup, Restore und Drive-Konflikte.

Alle produktiven Referenzdaten bleiben außerhalb des öffentlichen Repositories; Tests hier verwenden synthetische Spiegelbilder der Fachfälle.

## 5. Freigabegrenzen

1. Die Demo-Freigabe bleibt ausdrücklich eine **Simulation**; sie erzeugt keinen echten archivierten Abrechnungsstand.
2. Vor Datenimport oder echter Berechnung erst System-/Datenschutzgate, danach Paritätsgate, danach Dokumenten- und Betriebsfreigabe.
3. Sowohl alter Code als auch neue UI müssen unabhängig rücksetzbar bleiben.
4. Das Original-Repository `cz100000/NK-Pro` wird niemals durch NK-Pro-2.0-Commits verändert.
