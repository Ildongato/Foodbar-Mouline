# Productieoverstap Mouline — 30 september 2026

## Goedgekeurde bron

Ontwerp en inhoud: `4e2fa15b85f3473d1051f5389e19cb8496eebc2b` op `main`.
De complete stagingmanifest had dezelfde commit en status `complete`.
Deze release verandert de deployment, paden, indexering en afhandeling van oude URLs;
geen wijzigingen aan het goedgekeurde ontwerp of de inhoud.

Productie: https://www.mouline.be/
Fysiek pad: `/home/mouline/domains/mouline.be/public_html/`.
FTP is gechroot op `/home/mouline`; transportpad: `/domains/mouline.be/public_html/`.
De secret accepteert het fysieke pad en het transport gebruikt uitsluitend het geverifieerde FTP-pad.

## Verplichte volledige backup

Inventaris vóór de overstap: **767 bestanden, 118 submappen, 55.806.496 bytes**.
Alle bestaande bestanden, verborgen bestanden, oude backupmappen en `/nieuw/` zijn inbegrepen.
Oude homepage SHA-256: `86430779fb4aa48e970bcd74e3ed5e3d26334e1b3abc3a475cc75e5632b60efb`.
De oude website heeft geen bekende Git-commit; deze checksum en de volledige inventaris identificeren de versie.

Geverifieerd archief: `/home/mouline/backups/mouline-production-2026-09-30-162441Z.tar.gz`.
Alle 767 bestanden zijn volledig gelezen en op SHA-256 gecontroleerd; de broninventaris bleef ongewijzigd.
Het opnieuw gedownloade serverarchief is identiek aan de lokale kopie.
Archief SHA-256: `17c961be41cffcf44b39392b0f4fd1c6ec1cce8e44352f3e4d6d89b1d610ca0e`.
De lokale inventaris, originele bestanden, het archief en de checksums staan in de
naast de repository bewaarde map `mouline-production-release-20260930/`.
Die map en het archief worden nooit naar GitHub of public_html gekopieerd.
De initiële productie-upload vereist het geverifieerde receipt plus het volledige leesbare archief.
De productiehomepage wordt opnieuw met de backup vergeleken vóór vervanging.

## Deployment en bescherming

`.github/workflows/deploy.yml` publiceert pushes naar `main` en handmatige runs naar de productie-root.
Build: `MOULINE_BUILD_TARGET=directadmin MOULINE_DEPLOY_ENV=production pnpm build:pages`.
De vijf bestaande secrets blijven in gebruik:
`MOULINE_FTP_HOST`, `MOULINE_FTP_PORT`, `MOULINE_FTP_USERNAME`,
`MOULINE_FTP_PASSWORD`, `MOULINE_FTP_REMOTE_PATH`.
Alleen de waarde van het deploymentpad verandert. Geen nieuw wachtwoord of SMTP-secret nodig.

Het ownershipmanifest blokkeert onbekende bestandsconflicten. Bestanden worden nooit verwijderd.
Assets komen eerst, de routing daarna, de homepage als laatste. De complete manifest wordt pas
na de inhoudscontrole geschreven. `/nieuw/` is beschermd tegen upload en blijft ongewijzigd.
Legacy HTML verwijst door naar relevante secties; oude assets en backupmappen geven 404.
Directory listing is uitgeschakeld. Nieuwe productie wordt indexeerbaar; staging blijft noindex.

## Formulieren en infrastructuur

Reservatie, Catering en Andere vraag gebruiken `/api/contact.php` en dezelfde PHP-handler
met de bestaande `mail()`-infrastructuur naar `info@mouline.be`. Geen nieuwe provider.
Client- en servervalidatie, origincontrole, veilige headers, UTF-8, honeypot,
rate limiting en idempotency blijven behouden. Vacatureknoppen zijn gewone e-maillinks.
De demomodus is in deze build uitgeschakeld, ook via `?formDemo=1`.

DNS-nulmeting: A `185.220.172.6`, AAAA `2a06:2ec0:1:e::152`,
MX `0 mouline-be.mail.protection.outlook.com.`, nameservers `ns1.b-its.be.` / `ns2.b-its.be.`.
Dit zijn de werkelijke bestaande waarden, niet die uit de oudere overdrachtsnotitie.
DNS, MX, nameservers, mail.mouline.be, mailboxen en hosting worden niet gewijzigd.

## Rollback naar de oude website

1. Stop automatische productiedeployments voordat bestanden worden teruggezet.
2. Verifieer de archiefchecksum tegen het private receipt. Pak lokaal uit, niet in een openbare webmap.
3. Herstel uitsluitend de vervangen oude bestanden uit `public_html/` in het archief.
   Bij deze eerste overstap betreft dat de oude `index.html`; de originele assets en oude pagina's blijven staan.
4. De oude root had geen `.htaccess`. Bewaar de nieuwe routingconfiguratie buiten de webmap,
   en vervang haar door een gecontroleerde legacy-configuratie met `DirectoryIndex index.html`,
   `Options -Indexes` en dezelfde HTTPS-regels. Verwijder de nieuwe legacy-redirects/allowlist,
   maar blijf `BU 12 jun 2025`, `BU 16 nov 2021` en `_original files` publiek blokkeren.
5. Controleer de oude homepage, menupagina's en assets via HTTPS. Nieuwe managed bestanden
   hoeven niet verwijderd te worden. Laat `/nieuw/` en het volledige archief intact.
6. Zet de GitHub-workflow pas opnieuw aan na een expliciete keuze voor de gewenste versie.
   DNS, MX of mailboxen aanpassen is voor rollback niet nodig.

Nieuwe release-SHA en exact publicatietijdstip staan in het productie-deploymentmanifest.
Het afzonderlijke opleverrapport legt de daadwerkelijke verificaties en mailboxbevestiging vast.
