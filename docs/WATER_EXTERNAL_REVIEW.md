# Technischer Prüfadapter für Wasser & externe Einzelabrechnungen

**Status:** isolierte experimentelle Entwicklung, **nicht** im Browser geladen.

Die neue interne Komponente [`experimental/water-external-review.js`](../experimental/water-external-review.js) verknüpft die beiden bereits gegen NK-Pro V99.4.86 geprüften Fachbausteine für einen synthetischen 7-Wohnungs-Testfall. Dabei werden 2025-Hauswasserverbrauch, separate Kalt-/Warmwasserzähler, Mietwechsel, Privatanteil, Leerstand und ein externer Techem-Vermieteranteil von 3,88 € zusammen geprüft.

Sie unterscheidet **kritische Mängel** (z. B. fehlende Meterwerte, abweichende externe Provider-Summe) und **Prüfentscheidungen** (z. B. nicht verteilt bleibende Hauswasser-Differenz). Entscheidungen sind an die Quellsignatur gebunden; schon eine einzelne Änderung der Meterstände macht die alte Entscheidung ungültig, selbst wenn die Gesamtsumme unverändert ist.

Das Modul gibt `experimentalChecksClear` zurück, aber `readyForRealFinalization` ist **unwiderruflich false**, solange die vollständige 2025-Abrechnung, 44 Original-Prüfregeln, Briefe, Archiv, sichere Migration und fachliche Abnahme fehlen.

**Keine echten Objektdaten**, keine lokale Datenablage, kein Import/Export, keine Manipulation der bestehenden NK-Pro-App. Die öffentliche Website lädt dieses Modul nicht.
