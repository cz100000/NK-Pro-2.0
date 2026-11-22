# NK-Pro 2.0 – Fortführung mit GitHub Pages + Google (22.11.2026)

## Verbindliche Architekturentscheidung

**Kein Cloudflare, Firebase oder weiterer Hostinganbieter.** Bestehende Infrastruktur:

| Ebene | Version 1.0 | Version 2.0 |
|---|---|---|
| Quellcode | `cz100000/NK-Pro` | `cz100000/NK-Pro-2.0` |
| Frontend | `https://cz100000.github.io/NK-Pro/` | `https://cz100000.github.io/NK-Pro-2.0/` |
| Neue private Oberfläche | nicht betroffen | `https://cz100000.github.io/NK-Pro-2.0/private/` |
| Google-Identität | bereits vorhandener OAuth-Web-Client | derselbe öffentliche Client-ID-Wert |
| Private Cloud-Dateien | Ordner aus Version 1.0 | separater Drive-Ordner `NK-Pro 2.0 – Privatdaten` |
| Daten | Original-Schema 5 | eigenes, verschlüsseltes Schema `nkpro2-private-portfolio-v1` |

**OAuth**: Bei gleicher HTTPS-Origin `https://cz100000.github.io` sind die Pfade für Google OAuth irrelevant; der Origin muss nicht zusätzlich für Version 2.0 registriert werden, **wenn er bereits für Version 1.0 autorisiert ist**. Erstmals wieder ist eine Nutzeranmeldung und OAuth-Zustimmung erforderlich; keine Zugangsdaten/Passwörter an Entwicklungsassistenten weitergeben. Der neue Code verwendet `drive.file` und Google Identity Services.

**Google Drive** bleibt der Ort der zentralen Synchronisationsdateien, aber vor dem Upload mit AES-256-GCM verschlüsselt. Keine persönlichen Datensätze in Repository, GitHub Actions, JavaScript-Quellcode oder GitHub Pages. Der persönliche Tresor ist über eine öffentliche URL erreichbar; die Inhalte werden erst durch das persönliche Google-Konto und das eigene Tresorpasswort entschlüsselt.

## Bewusst akzeptiertes Same-Origin-Übergangsrisiko

Beide Projekt-Pages-Adressen haben denselben Browser-Origin `https://cz100000.github.io`. Verschiedene Pfade oder Repositories isolieren weder `localStorage` noch `IndexedDB` noch das DOM einer bewusst geöffneten gleichursprünglichen Seite. Die neuen 2.0-Speicherschlüssel sind gegen versehentliche Kollisionen, nicht gegen fremden Code in derselben Origin. Der eigenständige Service Worker ist auf `/NK-Pro-2.0/private/` begrenzt und cachiert ausschließlich statische App-Dateien.

Das Abschalten der 1.0-Veröffentlichung nach erfolgreichem Wechsel **entfernt die parallel erreichbare alte Anwendung** und reduziert das praktische Risiko; die Origin der 2.0-Webseite bleibt technisch die gleiche. Auch nach Abschaltung müssen alte Browserdaten, alte offene Tabs, installierte Versionen und 1.0-Service-Worker kontrolliert berücksichtigt werden. Bei einem Sicherheitsbedrohungsmodell, das absolute Origin-Isolation voraussetzt, würde später dennoch eine separate Domain benötigt.

**Keine voreilige Stilllegung der 1.0**: Sie ist bis zur vollständigen 2.0-Fachparität und Daten-Überprüfung der produktiv funktionsfähige Referenzstand. Entstehende Übergangsrisiken sind dokumentiert und nicht als vollständig gelöst darzustellen.

## Umsetzung im GitHub-Pages-Build

Die bestehende Demo bleibt unter der Hauptadresse **rein synthetisch**. Zusätzlich enthält die vom Pages-Workflow veröffentlichte statische Allowlist acht Dateien in einem separaten Pfad `private/`. Der private Bereich ist kein eigenständiger Rechnerkern und darf bis zur Freigabe **keine** 2025-Abrechnung finalisieren, erstellen oder drucken.

Der private Bereich ist auf exakt `https://cz100000.github.io/NK-Pro-2.0/private/` und `…/private/index.html` sowie den lokalen Entwicklungshost begrenzt. Quellbackup, Belege und generierte Importdaten dürfen niemals über diesen Pfad als Dateien ausgeliefert werden.

Vor jeder Veröffentlichung bestehen Security-, Syntax-, Unit- und reale Browser-Tests mit synthetischen Datensätzen. Die 2025er Originaldatei verbleibt vollständig außerhalb des Repositories.

## Kontrollierte Ablösung von 1.0 – erst nach Abnahme

1. 1.0 voll und unveränderbar sichern (lokal, verschlüsselt/privat); Quellen, Messwerte, Archivstände und die originalen 2025er Beträge dokumentieren.
2. 2.0 Echtdaten nach Schema 5 importieren, in eigenem Drive-Ordner sicher speichern, Export und Wiederherstellung auf einem zweiten Gerät erfolgreich demonstrieren.
3. Alle echten Abrechnungspfade, Dokumente, Meter-Historie, Salden, Zahlungen, Prüfregeln, Archive, Finanzen/Steuern und Mehrjahresauswertung gegen die 1.0-Belege und fachliche Anforderungen abnehmen. **Vorher keine Produktivfreigabe.**
4. Parallelbetrieb organisatorisch beenden (1.0 nur noch lesbar oder nicht mehr verwenden). Eine letzte aktuelle 1.0-Sicherung ziehen.
5. Erst auf ausdrückliche Benutzerfreigabe das **GitHub Pages Publishing** des 1.0-Repositories deaktivieren. Das 1.0-Repository und dessen Git-Historie bleiben als unveränderbare technische Referenz erhalten; nicht löschen.
6. Auf Computer und iPhone alte 1.0-Tabs und Home-Screen-Apps schließen, alte 1.0-Service-Worker/Caches prüfen, lokale 1.0-Speicherreste erst nach sicherem bestätigten Backup gezielt bereinigen (niemals die gesamte Origin ungeprüft löschen).
7. Sicherstellen, dass nur die aktuelle NK-Pro-2.0-App benutzt wird, Drive-Stand und Restore bestätigen. Eigene separate Origin bleibt optionaler Zukunftsschritt, kein neues Pflichtprojekt.

## Nächste erforderliche Benutzeraktion

**Keine Einrichtung eines Drittanbieters und keine zusätzliche Domain.** Die GitHub-Pages-Umstellung kann durch den verbundenen GitHub-Zugriff vollständig ausgerollt werden. Danach benötigt der Assistent lediglich die persönliche Google-Anmeldung im 2.0-Tresor (inkl. Passphrase-Auswahl und einmaligem ausgewähltem Snapshot) sowie den abschließenden iPhone-Funktionstest.

Auch nach erfolgreichem Datensync ist die Fachanwendung 2.0 vorerst **nicht abrechnungsbereit**.
