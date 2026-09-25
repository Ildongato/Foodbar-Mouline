# Mouline: geïsoleerde testdeployment

## Omgeving en audit

De bestaande React/Vite-site wordt statisch gerenderd. GitHub-defaultbranch is `main`.
DirectAdmin bevestigt PHP 8.2; een database is niet nodig. Op 25 september 2026
is de beveiligde FTP-toegang en de bestaande productiemap alleen-lezen gecontroleerd.

De actuele host is **web0152.zxcs.be**, IP **185.220.172.6**, explicit FTPS op poort 21.
Het TLS-certificaat is geldig voor die host. De oude overdrachtsnotitie bevat een ander IP.
`ftp.mouline.be` wijst naar dezelfde server, maar heeft geen passend FTP TLS-hostcertificaat.
Certificaatvalidatie wordt nooit uitgeschakeld. De server levert niet alle
tussencertificaten; de workflow vult uitsluitend de geverifieerde publieke Sectigo-keten
aan. Zie `hosting/certificates/README.md`. De geldigheid wordt tegen bestaande
systeemroots gecontroleerd; er wordt geen nieuwe root vertrouwd.

FTP-pad: `/domains/mouline.be/public_html/nieuw/`.
Fysiek serverpad: `/home/mouline/domains/mouline.be/public_html/nieuw/`.
Test-URL: https://www.mouline.be/nieuw/

## Automatisch deployen

`.github/workflows/deploy.yml` draait op pushes naar `main` en kan handmatig gestart worden.
De workflow controleert TypeScript, formulierlogica, PHP, doelmapbeveiliging en assetpaden.
Daarna uploadt curl via explicit FTPS. Alle bestanden blijven binnen `/nieuw/`.
Er is geen verwijdering, mirror of productie-cutover. Bestaande hashed assets blijven bewaard.
Een ownershipmanifest voorkomt het overschrijven van onbekende bestanden. Het wordt
voor de upload geschreven, zodat een onderbroken upload veilig hervat kan worden.
Ongewijzigde, eerder succesvol geüploade assets worden hergebruikt. Tijdelijke
verbindingsfouten krijgen maximaal twee nieuwe pogingen.
De productie-directory-inventaris en SHA-256 van de productiehomepage worden voor/na vergeleken.
Een HTTPS-controle verifieert de nieuwe homepage, assets en PHP-validatie zonder mail te sturen.

De vijf repositorysecrets zijn:

- `MOULINE_FTP_HOST`: geverifieerde host hierboven
- `MOULINE_FTP_PORT`: `21`
- `MOULINE_FTP_USERNAME`: bestaande FTP-gebruiker
- `MOULINE_FTP_PASSWORD`: uitsluitend GitHub Secret; nooit in code of logs
- `MOULINE_FTP_REMOTE_PATH`: exact het FTP-testpad hierboven

Build lokaal: `MOULINE_BUILD_TARGET=directadmin pnpm build:pages`.
Resultaat: `dist-directadmin/`. De bestaande Pages-build blijft apart in `dist-pages/`.
De testsite gebruikt `/nieuw/` voor assets en `/nieuw/api/contact.php` voor formulieren.
De testsite heeft `noindex`; de canonical blijft het uiteindelijke domein.

## Formulieren

De bestaande contactinterface ondersteunt Reservatie, Catering en Andere vraag.
Alle drie gaan via JSON POST naar de eigen PHP-handler, vervolgens via hosting `mail()`
naar `info@mouline.be`. Er is geen externe formulierdienst of SMTP-wachtwoord nodig.
From/envelope zijn `info@mouline.be`; Reply-To is het gevalideerde adres van de bezoeker.
De vacaturelinks blijven gewone e-maillinks.

Servervalidatie, origincontrole, JSON Content-Type, UTF-8, honeypot, veldlimieten,
header-injectiebescherming en rate limiting worden toegepast. Idempotency voorkomt dubbel
verzenden bij retries. Alleen hashes en verzendstatus worden met lock in de server-tempmap
bewaard, buiten public_html. Logs bevatten foutcodes, geen formulierinhoud of wachtwoorden.

HTTP 200 is onvoldoende: de browser eist expliciet `ok: true`. Bij mailfouten blijft de
invoer staan en verschijnt een echte foutmelding. Een reservatie blijft een aanvraag totdat
Mouline ze bevestigt. De DirectAdmin-build schakelt de formulierdemo ook via URL uit.
`mail()` bevestigt acceptatie door de mailserver; ontvangst moet aanvullend in de mailbox
getest worden. Het testresultaat staat in het opleverrapport.

## Afbakening

DNS, MX, nameservers, mailrouting, mailboxen, root-redirects, oude HTML, oude assets,
bestaande backups en eventuele productie-.htaccess blijven ongewijzigd.
GitHub Pages houdt zijn bestaande aparte workflow. Geen huisstijl/layoutwijzigingen.
De bestaande vakantie-popupconfiguratie wordt in deze technische migratie niet veranderd.

## Rollback en latere productie

Testrollback: revert de relevante codecommit op `main` of start de workflow van een
bekende eerdere release. De workflow overschrijft alleen beheerde testbestanden; oude
assets blijven staan. Onbekende bestanden of een ontbrekend manifest stoppen de upload.
Bij een onderbroken upload met geldig manifest: start de workflow opnieuw. Zonder
manifest: eerst de gedeeltelijke bestanden vergelijken met de build en eigendom
vaststellen; niet blind verwijderen of bescherming uitschakelen.

Productie is NIET onderdeel van deze workflow. Voor cutover zijn aparte expliciete
Goedkeuring en een volledige download/export van public_html noodzakelijk, inclusief
verborgen bestanden, assets en bestaande backupmappen. Bewaar deze buiten public_html
met inventaris en checksums; verifieer dat de backup volledig leesbaar is. Zonder complete
backup niet doorgaan. Maak daarna apart een root-build, test alle paden, pas uitsluitend
bekende beheerde bestanden aan en behoud oude bestanden. Geen remote delete, DNS- of
mailwijzigingen. Rollback productie: herstel precies de vervangen bestanden uit de
geverifieerde backup; laat onaangeraakte bestanden ongemoeid.
