# NK-Pro 2.0 – integrierte Google-Drive-Synchronisierung und Altdatenübernahme

Stand: 22.11.2026. Fachlicher Migrationsmeilenstein, **keine Freigabe der Berechnung 2025**.

## Architektur, ohne Datentresor-Oberfläche

Die Hauptanwendung unter \`https://cz100000.github.io/NK-Pro-2.0/\` enthält jetzt direkt unter **Systemstatus** einen Button für Google Drive und Datensicherung. Der vorher separat veröffentlichte \`/private/\`-Datentresor wird aus dem GitHub-Pages-Build entfernt. Sein bewährter neuer technischer Unterbau (AES-256-GCM, eingeschränkter Google-Drive-Zugriff, unveränderliche Uploads und Synchronisationskonflikt-Überprüfung) wird als Bibliothek **in der Hauptanwendung** verwendet. Keine zusätzliche Domain, kein Cloudflare, kein Firebase.

Die Hauptseite startet ohne private lokale Daten weiter mit ausdrücklich als synthetisch markiertem Testbestand. Sobald der Nutzer über Systemstatus einen gültigen privaten Altbestand einliest (oder einen bestehenden verschlüsselten 2.0-Bestand aus Google Drive lädt), wechselt die Hauptanwendung nach dem nächsten Laden in den **Echtdatenmodus**. Es wird dann kein synthetischer Demo-Portfoliozustand als echter Bestand ausgegeben. Der neue Echtbetrieb verwendet eine eigene Datenmodell-Schicht und ruft die synthetischen Abrechnungsfunktionen **nicht** für echte Daten auf.

Der Echtdatenmodus ist derzeit noch ein lesender Fachdatennavigator mit 2025-Neuanlage-Platzhalter; neue 2025-Abrechnungsergebnisse oder rechtsverbindliche Briefe werden damit **nicht** erstellt. Die vollständige Echtdaten-Bearbeitung ist ein nachfolgender Entwicklungsschritt.

## Verbindlich migrierter Umfang

**Stammdaten eines einzigen Objekts:** Source-ID OBJ-001, Nutzer-Kurzcode ARB5, Originalbezeichnung \`Objekt Am Rauhen Biehl 5\`, Anschrift \`Am Rauhen Biehl 5, 55774 Baumholder\`. Die ursprüngliche Objektnummer bleibt unverändert; es werden **keine erfundenen weiteren Objekte** übernommen.

- 7 Wohnungen (Wohnfläche zusammen 391,5 m²)
- 5 Mietverhältnisse; M000 als regulärer Abrechnungsteilnehmer mit korrigiertem, bestätigtem Einzug am 01.01.2010
- 16 bestehende Zähleridentitäten / Zählerstamm (keine 2025-Ablesungen)
- Kostenartenkatalog **ohne die aus Version 1.0 übernommenen Rechnungsbeträge des Jahres 2025**
- 5 historische, schreibgeschützte und **identitätsgetrennte** Archivinstanzen: 2024, 2023 (Teilbestand), 2023 (vollständiger Snapshot), 2022 und 2021/2022. Jedes Archiv enthält den originalen, unverändert erhaltenen Snapshot mit Kosten, Bewohner-/Zeitwerten und vorhandenen Berechnungsergebnissen. Fehlende Historie wird nicht rekonstruiert oder erfunden.

**Ausdrücklich NICHT migriert:**
- Die in NK-Pro 1.0 befindliche aktuelle **Nebenkostenabrechnung 2025**, inklusive Rechnungsbeträgen, Vorauszahlungen, Umlagen, Techem-Einzelwerten, 2025-Wasserablesungen, Briefangaben, Prüfungen und Abrechnungsergebnissen.
- Technischer Code, Funktionen, Renderer, Event-Handler und localStorage-Schlüssel von Version 1.0.
- Zusätzliche fiktive Demo-Objekte.
- Der originale vollständige Quell-Snapshot als 2.0-Laufzeitdatum. Quelle wird lediglich lokal auf Integrität geprüft und für die selektive Übernahme gelesen.

**2025 in NK-Pro 2.0:** Neues Jahresobjekt mit \`source: new-nkpro2-settlement\` und \`importedFromLegacy: false\`, leeren Kosten, leeren Zahlungstabellen, leeren Zählerablesungen, leeren Umlageinputs und leerer Ergebnisgrundlage. Die tatsächliche Erfassung und vollständige Abrechnung werden künftig innerhalb der neuen Anwendung aufgebaut.

## Datenschutz und Synchronisierungsregeln

Der Browser prüft zuerst die Originaldaten gegen das vorhandene Schema-5-Integritätsmerkmal. Danach werden nur die fachlich gewählten neuen Daten **vor lokaler Speicherung** verschlüsselt. Der öffentliche Quellcode, GitHub Actions und GitHub Pages enthalten **keine echten Bewohnerdaten, echten Archive oder Cloud-Snapshots**.

Google OAuth verwendet den bestehenden öffentlichen OAuth-Client von NK-Pro 1.0 und \`drive.file\`-Berechtigung. Die 2.0-Anwendung schreibt ausschließlich verschlüsselte, mit Parent-ID verknüpfte Versionen in ihren neuen Google-Drive-Ordner \`NK-Pro 2.0 – Privatdaten\`. Das erste Cloud-Hochladen erfordert einen bewussten Klick auf **Verschlüsselt in Drive sichern**; spätere Änderungen werden beim geöffneten, entsperrten und mit Google verbundenen Programm geprüft und bei unverändertem Remote-Stamm automatisch synchronisiert. Offline-Funktion: der separate 2.0-Service-Worker cached **nur statische App-Dateien**, während die lokalen Echtdaten verschlüsselt verbleiben. Nicht als echte dauerhafte Hintergrundsynchronisierung zu verstehen.

Ein eigenes Datenpasswort von mindestens 14 Zeichen ist zur Verschlüsselung und zur Entschlüsselung nach einem Browserneustart erforderlich. Es wird nicht in GitHub, Google oder lokalen permanenten Browserdaten gespeichert. Ohne dieses Passwort kann auch ein gültiger Google-Drive-Snapshot nicht entschlüsselt werden.

**Sicherheitsrisiko in der Parallelphase:** Die beiden GitHub-Pages-Projekte teilen weiterhin denselben Browser-Origin. Die getrennten lokalen Schlüssel und verschlüsselten Payloads schützen vor unbeabsichtigter Überschreibung und dem Auslesen der gespeicherten Klardaten; sie bilden jedoch keine vollständige Origin-Isolation. NK-Pro 1.0 darf erst nach gesichertem Umstieg und fachlicher Prüfung deaktiviert werden. Alte Service Worker/CacheStorage sind dann kontrolliert zu entfernen, nicht durch unbedachtes Löschen aller Browserdaten.

## Prüfungen

- Die Migration wurde mit dem im Chat vorliegenden unveränderten Original-Cloud-Snapshot V99.4.81 vom 21.11.2026 **im Tool ohne Datenveröffentlichung ausgeführt**. Prüfergebnis: exakt 1 Objekt, 7 Wohnungen, 5 Mieter, 16 Zähler, 5 einzigartige Archiv-Snapshots (2023 doppelt als unterschiedliche Exemplare), neue leere 2025-Abrechnung.
- Synthetische Regressionstests prüfen Integrität, Archivduplikate, M000-Korrektur und das strikte Nicht-Übernehmen von 2025.
- GitHub Actions prüft Unit-Tests, beide Demo-/Privat-Browserprüfungen und zusätzlich Klicktests mit der neuen Systemstatus-Integration einschließlich verschlüsseltem Import, einzelnen historischen Archivwerten und mobilem Offline-Restore. Die reale Google-Anmeldung mit Nutzerkonto und Safari/iPhone bleibt ein manueller Abnahmeschritt.

## Erstmaliger Benutzerablauf

1. In der normalen NK-Pro-2.0-Anwendung den Button **Google Drive · verbinden** unter Systemstatus öffnen.
2. Ein persönliches Datenpasswort vergeben; den Original-Cloud-Snapshot aus NK-Pro 1.0 lokal auswählen und **Altdaten prüfen & übernehmen** anklicken.
3. Die Hauptanwendung lädt im integrierten Echtdatenmodus neu. Zur Entschlüsselung den Systemstatus-Dialog öffnen und mit dem Datenpasswort auf **Lokale Daten öffnen** klicken. Die 7 Wohnungen, 5 Mietverhältnisse und fünf Archivstände erscheinen im normalen Navigationsbaum.
4. **Google verbinden**, dann **Verschlüsselt in Drive sichern**. Der erste Upload erfolgt erst nach manuellem Auslösen. Danach Versionsanzeige prüfen.
5. Am iPhone dieselbe Hauptadresse verwenden, Google verbinden, mit demselben Datenpasswort **Aus Google Drive laden**. Bei erstmaliger Anbindung folgt ggf. ein Neuladen und nochmaliges Entsperren.
6. Original-Backup aus 1.0 unverändert aufbewahren; keine 2025-Daten aus 1.0 übernehmen. 2025 ist innerhalb 2.0 neu anzulegen und erst nach allen Fachprüfungen abzurechnen.

**Produktivfreigabe noch nicht erteilt.** Eine erfolgreiche Cloud-Verbindung bestätigt nicht die fachliche Abrechnungsfähigkeit.
