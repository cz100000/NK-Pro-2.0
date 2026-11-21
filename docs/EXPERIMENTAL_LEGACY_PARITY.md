# Arbeitspaket: isolierte Legacy-Paritätsengine (experimentell)

**Stand:** 21.11.2026 · **Quelle:** `cz100000/NK-Pro` Commit `a089e1fe660dd5502799560efe2bc4b65a09f278`. **Status:** Test-/Migrationsvorbereitung, **keine Produktivfunktion**.

## Erreicht

Ein neues, DOM-/Storage-freies Modul `experimental/settlement-cost.js` ist von der bestehenden UI und der Demo getrennt. Es implementiert sechs ausgewählte Umlagearten als vorläufigen Kompatibilitätsprototyp:

1. Wohnfläche (Miettage berücksichtigt)
2. Personen (Personentage)
3. Miettage
4. Verbrauch (Gesamtverbrauchspreis und nicht gemessener Vermieterrest)
5. Verteilung auf alle Wohneinheiten
6. Verteilung nur auf aktive Wohneinheiten

Der tatsächliche originale Rechenkern liegt in `tests/reference/billing-calculation-v99.4.86.js` als gepinnte **Quellcode-Referenz** für Tests. Die Datei wurde mit Git-Blob-SHA `59947f89249457a505deb5eb8c674350b01b9f30` verifiziert. Sie wird nicht auf GitHub Pages ausgeliefert, sondern ausschließlich im Node-CI-Testkontext ausgeführt.

**Fachparität wird nur für die im Test erfassten Synthetikfälle beansprucht.** Dies sind insbesondere Flächen-/Personen-/Miettage, Teiljahre, Leerstand, Privatnutzung (Teilnehmer M000-ähnlich), Wohnungsmietwechsel und Restanteil bei Wohnungsverbrauch. Die Tests vergleichen nicht bloß vorab angenommene Sollwerte, sondern rufen die originale V99.4.86-Implementierung tatsächlich auf.

## Grenzen

Noch **nicht** portiert/validiert: externe Techem-Einzelabrechnungen und Original-Belegfalllogik, Preis-/Korrektursonderfälle, alle Regelprüfungen, Wasser-Multi-Zähler/2025-Datenübernahme, Kaltmietkorrekturen, Dokumentengenerator, steuerliche und finanzielle Rechnung, Datenspeicherung/Archiv.

## Schutz / Abnahme

- `experimental/settlement-cost.js` wird **nicht** von `index.html` oder der Live-Demo geladen.
- Produktive Original-Datensätze werden **nicht** gelesen oder ins öffentliche Repository kopiert.
- Nutzerfläche von NK-Pro 2.0 bleibt unverändert; bereits positiv beurteiltes UI ist geschützt.
- Original-Repo wird nicht beschrieben oder verändert.
- Nächster Arbeitsschritt: versionierten Datenschnittstellenvertrag für Mietverhältnisse/Einheiten/Techem definieren; fehlende Originalfälle hinzufügen; Testmatrix an der echten 2025-Abrechnung privat validieren.
