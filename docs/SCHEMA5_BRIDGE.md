# Sicherer Datenschnittstellenentwurf V99.4.86 → NK-Pro 2.0 (synthetisch)

**Ziel:** Technisch nachvollziehbare, rein lesende Überleitung der bestehenden **Schema-5-Felder** in neue Domänenmodelle, ohne die produktive NK-Pro-App anzusprechen.

Das Modul [`experimental/legacy-fixture-bridge.js`](../experimental/legacy-fixture-bridge.js) liest ausschließlich mit `fixtureKind:"synthetic"` gekennzeichnete, **in-memory erzeugte Testdaten** und leitet daraus ab:

- Abrechnungszeitraum, Wohnungsstamm mit Fläche und Status, Mietverhältnisse inklusive Nutzungsart/Privatanteil.
- Aktive Kostenarten, ursprünglicher Umlageschlüssel und Betrag.
- Separate, nur durch belegte Quellfelder bestätigte KW-/WW-Zählerwerte und Hausverbrauch.
- Einzelabrechnung je Fall und ausdrücklich vermieterseitige externe Sammelposition.
- Neues Quality-Inputmodell für das 44-Regel-Inventar.

**Fail-closed / keine stille Migration:**
- Fehlende Flächen, unklare Wohnungs- oder Zähleridentitäten und nicht vorhandene Gesamtwerte werden als **offene Issues** ausgewiesen.
- `zaehlerDaten`-Messperioden/Zählerwechsel sind noch **nicht** auf das Legacy-Wasserfallback abgebildet; bei deren Auftreten wird ausdrücklich eine Datenlücke markiert.
- Es werden nur freigegebene Quellfelder projiziert; private Kontakte oder OAuth-Daten werden nicht an die Fachmodelle weitergegeben.
- Weder Daten-Import noch -Speicherung, Synchronisation oder automatische Übernahme findet statt.
- `migrationPermitted:false` und `readyForRealFinalization:false` können nicht durch Testdaten überschrieben werden.

Der Vertragsadapter ist eine vorbereitende Architektur- und Testkomponente. **Echte** 2025-Schema-5-Daten dürfen erst nach separater Hosting-Origin und vollständiger Datenschema-/Archiv-/Golden-Master-Abnahme verwendet werden. Nicht im öffentlichen Demo-Browser geladen.
