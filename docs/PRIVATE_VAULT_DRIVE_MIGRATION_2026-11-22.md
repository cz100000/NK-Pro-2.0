# NK-Pro 2.0 – Private Migration und Google Drive

**Stand: 22.11.2026. Eigenständige, isolierte Implementierung; keine Produktivfreigabe.**

## Entwickelte Komponenten

- private/private-model.js – neue Fachdatenschnittstelle für den Cloud-Snapshot V99.4.81, Schema 5. Validiert Integritätschecksumme, Objekte, Referenzen, Kosten- und Techem-Abgleich und bildet Daten unabhängig vom alten technischen Code ab.
- private/vault-crypto.js – verschlüsselt vor Speicherung in Browser oder Google Drive mit AES-256-GCM, PBKDF2-SHA256 (310.000 Iterationen), zufälligem Salt und IV. Kein dauerhaft gespeichertes Passwort.
- private/drive-adapter.js – Google OAuth / Drive API mit eingeschränktem drive.file-Scope, eigenem Ordner „NK-Pro 2.0 – Privatdaten“, unveränderlichen verschlüsselten Versionen, Parents, Konflikt- und Verzweigungsprüfung.
- private/index.html, private/private-app.js und private/private.css – eigenständige private Oberfläche für Verschlüsselung, Import, Übersicht und Cloud-Aktualisierung. Auf github.io und ungesicherten Webadressen technisch blockiert. **Nicht in den Pages-Build aufgenommen.**
- scripts/verify-private-snapshot.cjs – lokaler Quellnachweis, optionales Exportieren in ein ausdrücklich angegebenes privates Zielverzeichnis. Kein automatischer Export, kein Upload.
- Tests: ausschließlich synthetische Quellen. Kein Original-JSON im GitHub-Repository.

## Echtdatenprüfung des vollständig hochgeladenen Original-Snapshots

Das neue Importmodul hat den Original-Snapshot NK-Pro V99.4.81 vom 21.11.2026 unverändert verarbeitet und sein historisches Originalmaterial als ausschließlich lesbare, nicht ausführbare Evidenz erhalten.

| Bereich | Ergebnis |
|---|---:|
| Wohnungen / heutige Mietverhältnisse | 7 / 5 |
| Wohnfläche | 391,5 m² |
| Zähler / Messwerte / Messperioden | 16 / 90 / 58 |
| Archive | 5 (2024, 2023/Alt, 2023/Voll, 2022, 2021/2022) |
| K002 | 164.231 Cent |
| K006 | 996.597 Cent |
| K009 | 150.300 Cent |
| Techem-Versorgung + separate Vermieterposition | 996.209 + 388 = 996.597 Cent |
| Vorhandene Quell-Integritätschecksumme | stimmt |
| M000 – bestätigter Stammdateneinzug | 01.01.2010; ursprünglicher Quellwert bleibt im Originalnachweis |
| Abrechnung 2025 | Entwurf, keine Freigabe |

Die fünf Archivinstanzen bleiben anhand eindeutiger IDs unabhängig erhalten. Zwei unterschiedliche 2023-Stände werden nicht verschmolzen oder ungefragt normalisiert. Original-Belege und Quellmetadaten sind als unveränderliches Nachweismaterial im verschlüsselten Datencontainer enthalten, nicht als ausführbarer Version-1-Code oder Laufzeiteinstellungen. Der Privatanteil M000 bleibt ein regulärer Abrechnungsteilnehmer.

## Strikte Hosting- und OAuth-Grenze

Die öffentliche GitHub-Pages-URL von Version 2.0 teilt ihre Origin mit NK-Pro 1.0. Der private Tresor darf dort **niemals** laufen oder sensible Daten zwischenspeichern. Er erfordert eine eigenständige HTTPS-Domain/Hosting-Origin (z.B. getrennte Pages.dev-Subdomain) mit passenden Security-Headern.

Die öffentliche OAuth-Web-Client-ID aus NK-Pro 1.0 ist verwendbar, **sofern der Kontoinhaber die neue HTTPS-Origin in Google Cloud als Authorized JavaScript origin freischaltet**. Dazu ist eine echte Google-Anmeldung und individuelle Freigabe erforderlich. Die Anwendung fragt nur den Scope drive.file an und schreibt in einen separat erstellten Drive-Ordner. Die Cloud wird alle 45 Sekunden beziehungsweise bei Fokus geprüft, während die Anwendung offen, verbunden und entsperrt ist. Kein Sync bei geschlossener App und keine Echtzeit-Kollaboration.

Der private Nutzer muss eine mindestens 14 Zeichen lange Passphrase wählen und außerhalb des Browsers sicher aufbewahren. Nur er kann Daten entschlüsseln, auch Google kann die eigene Passphrase nicht wiederherstellen. Die originalen 1.0-Dateien bleiben unangetastet.

## Offene Produktivfreigabe-Voraussetzungen

1. Privater HTTPS-Host und OAuth-Zulassung: Kontoinhaber erforderlich.
2. Echter Drive-/OAuth-Test auf zwei Geräten sowie Safari/iPhone-/Offline-/Konflikttests: Kontoinhaber erforderlich. Die automatischen Node-Tests beweisen nur die simulierte API.
3. Integration der neuen privaten Fachmodelldaten in die gesamte noch nicht fachlich vollständige NK-Pro-2.0-Bearbeitungsoberfläche: weitere Entwicklung; bis dahin ist die private Ansicht ein **lesender Tresor**, keine Abrechnungssoftware.
4. Austausch der in der öffentlichen Demo noch vorhandenen alten Brief-Renderer durch unabhängigen NK-Pro-2.0-Code, Golden-Master-Abgleich und Prüfung aller Abrechnungsfunktionen.
5. Rechnungs-, Vorauszahlungs-, Einzelteilnehmer-, Archiv-, Brief-, Steuer- und Analyseparität und alle 44 Fachprüfungen. Erst dann 2025er Abrechnung freigeben.

**Keine Echtdaten, Passwörter oder OAuth-Tokens in einem öffentlichen Repository. NK-Pro 1.0 bleibt unangetastet.**
