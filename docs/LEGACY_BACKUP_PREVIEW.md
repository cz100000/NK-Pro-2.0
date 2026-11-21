# Read-only Legacy-JSON-Inspektor (noch nicht in der App)

**Status:** Experimentell – Testbibliothek für Offline-Migrationsvorbereitung, keine Browserfunktion.

Die bestehende NK-Pro-V99.4.86-Anwendung erzeugt mehrere JSON-Typen. Eine vollständige Sicherung kann als **roher Gesamtzustand** exportiert werden, die Backup-/Restorekomponente kann außerdem eine versionierte `nk-pro-backup-envelope` mit FNV1A32-Prüfsummen erzeugen.

Das neue Modul `experimental/legacy-backup-inspector.js` erkennt beide Formen, überprüft die drei eingebetteten Prüfsummen bei signierten Legacy-Envelopes und liefert ausschließlich eine **anonymisierte Strukturdiagnose** (Schema, Abrechnungsjahr, Anzahl Wohnungen/Mietverhältnisse/Kostenarten/Archive). **Namen, Kontakte und Abrechnungsbeträge werden nicht ausgegeben.**

Die Original-Backupprüfung ist für synthetische Testfälle unter `tests/reference/backup-recovery-v99.4.86.js` test-only eingefroren. Beschädigte Daten werden erkannt; ungesicherte rohe JSON-Exporte werden ausdrücklich als `integrity: not-provided` gekennzeichnet.

**Sicherheitsgrenzen:** Das Modul ist **nicht** in `index.html` eingebunden, importiert keine Dateien, besitzt keine Speicher- oder Netzwerkfunktionen und verändert keine bestehenden NK-Pro-Daten. Es ist kein Reparatur- oder Migrationsassistent. Realer Datenimport wird erst nach Hosting-Origin-Trennung, Datenschema-/Rollbackplan und fachlicher Parität umgesetzt.
