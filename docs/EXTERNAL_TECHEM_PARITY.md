# Techem / externe Einzelabrechnung – experimentelle Fachparität

Quellstand: NK-Pro V99.4.86 (`js/billing-calculation.js`), Commit `a089e1fe660dd5502799560efe2bc4b65a09f278`.

Ein neues, isoliertes Modul [`experimental/external-techem.js`](../experimental/external-techem.js) übernimmt die **synthetische Modellierung von Einzelfällen** (Mietverhältnis, Privatanteil, tatsächlicher Leerstand) und die Zuordnung einer externen Kostenabrechnung. Jede Fallzuordnung wird durch `tests/external-techem-parity.test.cjs` direkt gegen `NKProBillingCalculation.individualValueCases()` und `allocationForCost()` aus dem Originalcode verglichen.

**Verbindliche Fachregeln:**
- Privatanteil wird technisch wie ein reguläres Mietverhältnis behandelt. Er ist **kein** stiller Eigentümerausschluss.
- Leerstand erscheint als eigener Abrechnungsfall – ohne künstlichen Mieterdatensatz.
- Die externe Sammelposition **3,88 €** dient als **separat dokumentierter Vermieteranteil**. Sie fließt in den externen Gesamtbetrag ein, **nicht** in die Mieter-, Privat- oder Leerstandseinzelwerte.
- Das originale Rückrechnungsmodell enthält `ownerShare = Gesamtbetrag − Summe Teilnehmerwerte`. Zusätzlich werden `vacancyShare` und `externalOwnerShare` einzeln ausgewiesen. Es ist daher falsch, die beiden letztgenannten Werte **nochmals** von der Gesamtrechnung abzuziehen.
- Fehlende Einzelwerte, unerklärte Eigentümerreste und Abweichungen von der externen Abrechnung werden als offene Prüffunde ausgegeben, statt still verteilter Beträge.

**Wichtig:** Der Referenztest nutzt nur komplett erfundene IDs und Kostenwerte sowie die ausdrücklich bestätigte abstrakte 3,88-€-Regel. **Keine** echten Techem-Rechnungsdatensätze oder Mieternamen im öffentlichen Repository.

**Nicht umgesetzt:** Echte externe Techem-Quellfelder, CO₂-/Heizkosten-Vermieterpflichtanteile, Zählerwechsellogik, 2025-JSON-Migration, Stammdatenintegration, Druckreife und Freigabe. Das Modul wird **nicht** in der öffentlich sichtbaren NK-Pro-2.0-Demo geladen.
