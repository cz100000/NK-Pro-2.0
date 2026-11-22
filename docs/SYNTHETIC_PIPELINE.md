# Integrierte Testkette – NK-Pro 2.0 (synthetisch)

**Stand:** 22.11.2026. **Komponentenstatus:** echtes Node-basiertes Testlabor, **keine** freigegebene 2025-Nebenkostenabrechnung.

Das neue Modul [`experimental/synthetic-pipeline.js`](../experimental/synthetic-pipeline.js) verbindet erstmals in **einem ausführbaren Durchlauf** die zuvor getrennten Komponenten:

1. Gesicherte Schema-5-Feldüberleitung ausschließlich für ausdrücklich synthetische In-Memory-Daten (`legacy-fixture-bridge.js`).
2. Zehn experimentelle Qualitätsprüfungen (sieben Stammdaten-/Periodenprüfungen plus drei kostenbezogene Pflichtprüfungen) und das vollständige 44-Regel-Inventar (`quality-contract.js`); bei explizit bereitgestellten synthetischen Kosten bleiben **34 Regeln „nicht ausgeführt“**.
3. Kalt-/Warmwasser und Hausverbrauchsabgleich 2025 (`water-2025.js`).
4. Externe Techem-Einzelwerte, Privatanteile und vermieterseitige Sammelposition (`external-techem.js`).
5. Vollständigkeit der Empfängerliste sowie Cent-genaue **Datensummen** der Musterbriefe (`letter-preflight.js`).

Das Modul gibt eine zusammenhängende Prüfakte mit den Bereichen **Datenquelle, Qualität, Wasser, externe Einzelabrechnung und Briefdaten** aus. Kritische Mängel und zu bestätigende Differenzen sind getrennt. Entscheidungen haben quellgebundene SHA-256-Signaturen, die sich bei jeder Änderung der betroffenen Quelldaten verändern. Der Lauf ändert **keine** Quellobjekte und speichert nichts.

**Begrenzung:** Der Lauf prüft noch keine vollständige Abrechnung durch die verschiedenen Produktivberechnungsmethoden; Techem-, Wasser- und Dokumentdatensätze werden als **getrennte** synthetische Modelle validiert. Es wird **keine** echte Abrechnung erzeugt. Insbesondere muss der Original-Briefgenerator noch integriert und gegen alle 2025-Briefe geprüft werden.

**Harte Schutzschranke:** `readyForRealFinalization` bleibt unabhängig vom Ergebnis **false**. Echte Mieter-JSONs werden nicht angenommen. Die bisherigen 44 Regeln sind nicht vollständig ausgeführt, ein produktiver 2025-Datenimport, A4/PDF-/Archivfreigabe und eine getrennte Hosting-Origin fehlen. Der alte GitHub-Code und die alte Website bleiben unangetastet.
