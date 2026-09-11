# Rechtstreeks contact via de bestaande Mouline-hosting

Home3 gebruikt `Verstuur je aanvraag`. De vaste ontvanger is **info@mouline.be**.
De huidige website draait op PHP; deze aparte koppeling behoudt het oude formulier.

## Activeren (nog niet uitgevoerd)

1. Plaats `mouline-contact.php` met hostingbeheer/SFTP op
   `https://www.mouline.be/assets/php/mouline-contact.php`.
   PHP 8.1+, `mail()` en een schrijfbare systeem-tempmap zijn vereist.
   Controleer bij de hosting dat mail uit `info@mouline.be` geaccepteerd wordt.
2. Zet lokaal in `.env.local`:
   `NEXT_PUBLIC_CONTACT_ENDPOINT=https://www.mouline.be/assets/php/mouline-contact.php`.
   Bouw opnieuw met `pnpm build:pages`.
3. Zet dezelfde URL als GitHub repository variable `NEXT_PUBLIC_CONTACT_ENDPOINT`.
   De Pages-workflow leest deze openbare URL bij de volgende goedgekeurde publicatie.
4. Controleer na activering met toestemming één echte aanvraag in de mailbox,
   inclusief Reply-To, en klik op beantwoorden. Een succesvolle `mail()`-aanroep
   betekent dat de hosting de mail heeft aangenomen, niet dat bezorging bewezen is.

Zonder ingestelde URL geeft Home3 een duidelijke foutmelding na een verzendpoging;
het opent geen mailprogramma en simuleert geen verzending. Home en Home2 behouden
hun bestaande gedrag. De oude Node/Resend-route blijft ongemoeid.

## Behoud

- Ontvanger en afzender staan vast op het eigen domein; alleen Reply-To komt van de klant.
- Servervalidatie voor reservatie/catering/vraag; geen automatische tafelbevestiging.
- Alleen toegestane origins, JSON, beperkte berichtlengte, honeypot en verzendlimiet.
- Dubbele retries worden gedurende 24 uur herkend. Tijdelijke metadata bevat geen
  formuliertekst of ruwe IP-adressen; alleen hashes, tijdstippen en verzendstatus.
- Dit PHP-bestand staat bewust buiten `public/`: het hoort op PHP-hosting,
  niet tussen de statische bestanden van GitHub Pages.

## Lokaal gecontroleerd

PHP 8.2-syntax en verzoeken uitgevoerd in een tijdelijke PHP-WASM-testomgeving,
met uitsluitend een nagebootste mailfunctie: oorsprongscontrole, CORS-preflight,
ongeldige invoer, vaste ontvanger/Reply-To, formulierkeuzes, dubbele retries,
verzendfout en verzendlimiet. Geen echte e-mails verstuurd. Build en TypeScript
gecontroleerd; echte bezorging wacht op toegang tot de hosting en activering.
