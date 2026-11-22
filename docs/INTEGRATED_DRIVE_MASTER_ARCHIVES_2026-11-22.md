# NK-Pro 2.0 – integrierte Google-Drive-Synchronisierung und Altdatenübernahme

Stand: 22.11.2026. Fachlicher Migrationsmeilenstein, **keine Freigabe der Berechnung 2025**.

## Architektur, ohne Datentresor-Oberfläche

Die Hauptanwendung unter \`https://cz100000.github.io/NK-Pro-2.0/\` enthält jetzt direkt unter **Systemstatus** einen Button für Google Drive und Datensicherung. Der vorher separat veröffentlichte \`/private/\`-Datentresor wird aus dem GitHub-Pages-Build entfernt. Sein bewährter neuer technischer Unterbau (AES-256-GCM, eingeschränkter Google-Drive-Zugriff, unveränderliche Uploads und Synchronisationskonflikt-Überprüfung) wird als Bibliothek **in der Hauptanwendung** verwendet. Keine zusätzliche Domain, kein Cloudflare, kein Firebase.

Die Hauptseite startet ohne private lokale Daten weiter mit ausdrücklich als synthetisch markiertem Testbestand. Sobald der Nutzer über Systemstatus einen gültigen privaten Altbestand einliest (oder einen bestehenden verschlüsselten 2.0-Bestand aus Google Drive lädt), wechselt die Hauptanwendung nach dem nächsten Laden in den **Echtdatenmodus**. Es wird dann kein synthetischer Demo-Portfoliozustand als echter Bestand ausgegeben. Der neue Echtbetrieb verwendet eine eigene Datenmodell-Schicht und ruft die synthetischen Abrechnungsfunktionen **nicht** für echte Daten auf.

Der Echtdatenmodus ist derzeit noch ein lesender Fachdatennavigator mit 2025-Neuanlage-Platzhalter; neue 2025-Abrechnungsergebnisse oder rechtsverbindliche Briefe werden damit **nicht** erstellt. Die vollständige Echtdaten-Bearbeitung ist ein nachfolgender Entwicklungsschritt.

## Verbindlich migrierter Umfang

**Stammdaten eines einzigen Objekts:** Quellobjekt-ID OBJ-001 und Nutzer-Kurzcode ARB5. Objektbezeichnung, Straße, Postleitzahl und Ort werden ausschließlich aus dem privaten Quell-Snapshot gelesen und sind nicht in öffentlichen Quelldateien hinterlegt. Die ursprüngliche Objektnummer bleibt unverändert; es werden **keine erfundenen weiteren Objekte** übernommen.

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

## Direkte Übernahme aus dem bereits vorhandenen Google Drive (22.11.2026)

Der Benutzer muss **keine Sicherungsdatei mehr herunterladen, auswählen oder hochladen**. Ich habe den tatsächlichen Quellordner `NK-Pro – Privatdaten` im Google Drive und darin die Originaldatei vom 21.11.2026, 19:34 Uhr UTC, nachgewiesen. Der bereits verwendete OAuth-Webclient von NK-Pro 1.0 und die neue 2.0-Anwendung nutzen denselben Client-ID-Wert und den eingeschränkten Scope `drive.file`.

Unter **Systemstatus → Google verbinden** ruft NK-Pro 2.0 nun den bisherigen Ordner **ausschließlich lesend** ab. Der jeweils aktuellste Original-Snapshot wird anhand Zeitstempel gefunden. Ein neuer Button **Altdaten direkt aus Drive übernehmen** führt dann die folgenden Schritte in einem einzigen Vorgang aus:

1. Original-Snapshot von NK-Pro 1.0 aus dessen bereits vorhandenen privaten Google-Drive-Ordner lesen; vollständige Schema-5-Integrität prüfen.
2. Nur den einzelnen ARB5-Objektstamm, sieben Einheiten, fünf Mietverhältnisse, Zähleridentitäten und alle fünf individuellen Vorjahresarchive in ein neues **eigenständiges 2.0-Datenmodell** überführen. Die beiden 2023-Archive werden nicht zusammengeführt.
3. **Alle 2025-Abrechnungswerte bleiben ausdrücklich ausgeschlossen**. Das neue 2025-Jahresobjekt enthält keine 1.0-Kosten, Vorauszahlungen, Umlagen, Zählerablesungen oder Ergebnisse.
4. Datensatz zuerst verschlüsselt im Browser sichern, danach verschlüsselt als neue Datei im **eigenen Drive-Ordner `NK-Pro 2.0 – Privatdaten`** speichern. Die 1.0-Quelldatei, der alte Drive-Ordner und die 1.0-Anwendung bleiben vollständig unverändert.
5. Nach dem Neuladen lokalen verschlüsselten Bestand einmal mit dem Datenpasswort entsperren. Der echte Bestand erscheint in der normalen NK-Pro-2.0-Navigation. Auf dem iPhone mit demselben Google-Konto anmelden und den bestehenden 2.0-Drive-Stand mit demselben Datenpasswort öffnen.

**Verbleibende persönliche Mitwirkung:** Google-OAuth-Anmeldung und einmalige Vergabe eines sicheren Datenpassworts (mindestens 14 Zeichen). Beide Schritte können nicht stellvertretend aus der ChatGPT-Google-Drive-Verbindung autorisiert werden. Bei fehlendem Zugriff auf die alten Dateien über den Browser-OAuth-Client steht ein manueller Backupimport **nur als Ausweichweg** in einem eingeklappten Detailfeld bereit.

**Schutz vor Überschreiben:** Wenn bereits ein lokaler oder entfernter 2.0-Bestand existiert, wird der Neuimport blockiert. Bei vorhandener 2.0-Clouddatei muss dieser Stand gezielt geladen werden. Es gibt kein automatisches Zurückschreiben in Version 1.0.

**Abnahmestand:** Der Quellbestand ist technisch **in Google Drive vorhanden und für die neue Anwendung lesbar gemacht**. Die neue verschlüsselte 2.0-Datei wird erst nach der persönlichen OAuth-Berechtigung und Passphrase vergeben; sie wurde nicht unautorisiert angelegt. Automatisierte Tests prüfen simulierte Drive-Anbindung und Browser-Klickstrecke; produktive Google-OAuth-/iPhone-Tests folgen erst mit tatsächlichem Account-Zugriff.

**Produktivfreigabe noch nicht erteilt.** Eine erfolgreiche Cloud-Verbindung bestätigt nicht die fachliche Abrechnungsfähigkeit.
