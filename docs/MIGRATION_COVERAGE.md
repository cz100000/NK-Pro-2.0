# NK-Pro 2.0 · Verbindliche Ist–Soll-Abdeckungsmatrix

**Referenzquelle:** [NK-Pro V99.4.86](https://github.com/cz100000/NK-Pro/tree/a089e1fe660dd5502799560efe2bc4b65a09f278). **Status:** 21.11.2026.

- **17** bestehende Navigationseinträge + **4** interne Seiten → je **ein definierter Zielbereich** in NK-Pro 2.0.
- **44** in `quality-rules.js` deklarierte Prüfregeln (20 Pflicht, 12 Plausibilität, 6 Hinweise, 6 Technik) → jeweils definierter künftiger Funktionsbereich.
- Vollständige maschinenprüfbare Zuordnung in [`contracts/legacy-coverage.json`](../contracts/legacy-coverage.json).
- Gefrorene Ausgangsquellen `tests/reference/navigation-v99.4.86.js` und `tests/reference/quality-rules-v99.4.86.js`, Git-Blob-SHA geprüft, ausschließlich in Node-CI; **niemals** Teil des GitHub-Pages-Artefakts.

**Zwingende Unterscheidung:** `ui-prototype-only` bedeutet ausschließlich, dass in der Neugestaltung eine Oberfläche konzipiert wurde. Es bedeutet ausdrücklich **keine** fachliche Funktionsfähigkeit. `not-ported` kennzeichnet die noch offenen Regeln.

## Abdeckung je Zielbereich

| Zielbereich | Legacy-Seiten | Ziel |
| --- | --- | --- |
| Übersicht | `start`, `objektuebersicht` | aktueller Stand, offene Aufgaben, Jahreskontext |
| Abrechnung | `mieter`, `einnahmen`, `einstellungen`, `manuellewerte`, `umlage`, `vorauszahlungsanpassung`, `qualitaet`, `kostenumlagenabgleich`, `verbraeuche` | ein zusammenhängender Arbeitsplatz |
| Objekt | `objekt`, `wohnungsverwaltung`, `wasser`, `mieterverwaltung` | zentraler Stammdatenort |
| Analysen | `auswertungen` | NK, Finanzen/Cashflow, Steuerwerte |
| Dokumente & Archiv | `briefe`, `archiv`, `export` | Briefe, Ergebnisexport, eingefrorene Stände |
| System | `regelinventar`, `sicherung` | Expertenprüfungen und Datensicherung |

**CI-Gate:** Eine Regel oder Seite, die in der Ausgangsversion vorhanden war, darf aus der Matrix nicht versehentlich entfernt werden. Die Tests schlagen fehl, wenn sich Quell-Fingerprints oder Mengen/Zielzuordnungen widersprechen.

**Offene Fachthemen:** Alle 44 Regeln sind inventarisiert; davon laufen 10 nur in synthetischen Tests (34 sind noch nicht portiert). Der experimentelle sechs-Methoden-Rechenkern wird separat getestet und ist noch nicht mit der UI verbunden. Produktive Daten und Abrechnungen verbleiben in NK-Pro 1.0.
