# NK-Pro 2.0 – Fachtest 0.9: Objektverwaltung, Navigation und Cloud-Datenmodell

**Datum:** 22.11.2026 · **Status:** synthetischer Funktionstest · **keine produktive Freigabe**

## Umgesetzte Oberfläche
- Linke Navigation Desktop **288 px**, Mobil **295 px**; einheitliche SVG-Icons für Objekte, Stammdaten, Wohnungen, Verträge, Zähler und Jahresabrechnungen; drehbare SVG-Chevrons statt Textzeichen.
- Startseite als responsives Immobilienkarten-Raster (Objekt, Anschrift, Wohnungen, Jahresstände). Aktionsmenü je Objekt: archivieren/wiederherstellen und **nur bei absolut leeren Objekten** endgültig löschen.
- Aufklappbarer Immobilienbaum bleibt einziger Weg, um das Objekt zu wechseln.
- „Objekt → Jahresabrechnungen → Alle Jahre“ enthält ausschließlich die Jahre des aktiven Objekts; globaler Objektfilter und „Alle Objekte“ im Jahresarbeitsplatz sind entfernt.
- Neue fiktive Immobilie → Wohnung hinzufügen → Mietverhältnis anlegen → synthetischen Jahresfall anlegen. Ein Jahresfall kann nicht ohne passende Wohnungen und Verträge erzeugt werden.

## Cloudfähiger Datenvertrag, konkret implementiert
- **Portfolio**: unverändertes lokales Schlüsselpräfix `nkpro2_synthetic_portfolio_0_7_v1`, `schema: nkpro2-estates-synthetic-v1`, neue additive Felder `sync:{format:2,revision,updatedAt}` und `tombstones[]`.
- **Objekt**: dauerhaft stabile `id`, Stammdaten `name/street/postalCode/city`, `units[]`, `tenancies[]`, `settlements{year:record}`, unveränderte fachliche `revision`, zusätzlich `sync:{version,updatedAt}` und `lifecycle:{status,archivedAt}`.
- **Jahresfall**: stabile Kombination `objectId + year`, fachliche `settlement.masterRevision` für den kontrollierten Stammdatenabgleich, separate `sync:{version,updatedAt}`; Jahresänderungen erhöhen **nicht** die fachliche Stammdatenrevision.
- **Neu angelegte IDs**: UUID aus WebCrypto im sicheren Browserkontext; in isolierten Node-Domänentests ohne WebCrypto ein synthetischer Test-Fallback.
- **Archivieren**: Datensatz bleibt mit allen Jahresständen erhalten und wird nur aus dem aktiven Baum entfernt. Wiederherstellen erhält die Identität.
- **Löschen**: nur wenn das Objekt **keine Wohnung, keinen Vertrag und kein Abrechnungsjahr** enthält. Ein Tombstone bewahrt ID, Löschzeit und vorherige Version; das verhindert spätere unbemerkte Wiederauferstehung in einem Cloudabgleich.
- **Migration**: `upgradePortfolio` ergänzt die neuen Metadaten zu bisherigen 0.7-Datensätzen, ohne IDs, Kosten, Verträge oder Jahresinhalte umzuschreiben. Kein LocalStorage-Key-Wechsel.

## Providerneutrale Synchronisationsfunktionen
- `syncSnapshot(portfolio)` bildet einzelne Records `object/{id}` (nur Objektstamm einschließlich Wohnungen/Verträgen), `annual/{objectId}/{year}` (eigener Jahresrecord) und Objekt-Tombstones. Die lokale `selectedObjectId`-/`selectedYear`-Auswahl wird nicht synchronisiert.
- `planSync(base,local,remote)` ist ein **dreiseitiger reiner Planer**: Änderungen nur lokal → Upload-Vorschlag; nur remote → Download-Vorschlag; konkurrierende, voneinander abweichende Änderungen derselben Record-ID → **Konflikt**. Der Planer verändert weder lokale noch entfernte Daten. `base` muss die zuletzt bestätigte gemeinsame Fassung sein.
- Lokale Browseränderungen werden vor dem Schreiben zusätzlich mit dem zuletzt geladenen Speichereintrag verglichen. Abweichende Daten eines zweiten Tabs werden **nicht still überschrieben**; beschädigte Portfolio-Daten werden nicht automatisch durch Musterdaten ersetzt.

## Bewusste Grenzen und Fortsetzung der Stufen 3–7
- **Noch keine echte Google-Drive- oder Google-Cloud-Anbindung.** Die vorbereiteten Verträge sind kein funktionsfähiger Sync-Adapter und keine Datensicherung.
- Vor Echtdatenbetrieb erforderlich: getrennte Origin von NK-Pro 1.0, belastbare Offline-/IndexedDB-Speicherung, OAuth/Identitätsmanagement, Cloud-Revisionsprüfungen/Transaktionen, dauerhaft gespeicherte Sync-Basis, verschlüsselte Backups, Konflikt-UI, Wiederanlauf, Datensicherheitsprüfung und migrationssichere Datenimporte.
- Eine Google-Drive-Anbindung könnte Objektstamm/Jahresstände als getrennte versionierte Dateien ablegen; für Firestore/Cloud-Datenbank wäre ein entsprechender Adapter mit atomaren Versionsbedingungen nötig. Die Wahl ist offen, weder Authentifizierung noch externe Schreibzugriffe sind eingerichtet.
- Die weiteren Fachfunktionen der Entwicklungsstufen 3–7 bleiben offen; die aktuelle Demo darf **keine echten Mieterdaten** enthalten und kann noch **keine produktive Nebenkostenabrechnung** erstellen.

## Prüfungen
Automatische Tests decken 7/3/2-Bestand, neue Objektkarten, fachliche Objektisolation, Hinzufügen, Archivieren und Wiederherstellen, Löschschutz und Tombstones, rückwärtskompatible Bestandsdaten sowie Sync- und Konfliktszenarien ab. Chromium-E2E prüft Desktop/Mobil, Objekt-/Jahreswechsel und fehlende Seitenüberläufe. Tests ersetzen keine fachliche Endabnahme.
