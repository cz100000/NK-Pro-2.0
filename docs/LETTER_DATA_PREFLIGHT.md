# Dokumente und Abrechnungsbriefe – datenbezogener Vorabprüfer (experimentell)

Originalquelle: [`document-data.js` V99.4.86](https://github.com/cz100000/NK-Pro/blob/a089e1fe660dd5502799560efe2bc4b65a09f278/js/document-data.js), Git-Blob `3df7d1b05696860e658be1e5ede6c163ed26bbab`.

**Neues Modul:** [`experimental/letter-preflight.js`](../experimental/letter-preflight.js) überprüft ausschließlich **synthetische** Dokumentendatensätze für jeden Abrechnungsteilnehmer: Empfänger und Anschrift, Briefdatum/Absender, jede Kostenzeile, Cent-genaue Übereinstimmung mit Kostenanteilen und Vorauszahlungen sowie den signierten Saldo. Verglichen wird der Saldo direkt mit `NKProDocumentData.settlementInfoForResult()` aus dem gepinnten Original.

Zusätzlich gibt es eine Bundleprüfung, die fehlende Empfänger erkennt. M000-ähnliche Privatnutzung wird technisch nicht vom Brief ausgeschlossen. Dokumententscheidungen sind an einen SHA-256-Fingerprint des Briefdatensatzes gebunden: Ändern sich Adresse, Beträge oder Einstellungen, ist eine ältere Freigabe automatisch veraltet.

**Sicherheitsgrenze:** `dataReady:true` bedeutet nur vollständige, zahlenkonsistente Musterdaten. Es findet **keine** A4-Druckerzeugung statt; `readyForPrint:false` und `readyForRealFinalization:false` sind fest verdrahtet. Vollständiger Originalbriefgenerator, 2025-Kostenkategorien, A4-Paginierung, Druck- und PDF-Gleichheit, Nachtragsbelege und Archiv bleiben separat umzusetzen. Dieses Modul ist **nicht** im öffentlichen Demo-UI geladen.
