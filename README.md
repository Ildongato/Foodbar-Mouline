# Foodbar Mouline

Een Nederlandse onepage voor Foodbar Mouline, met het bestaande Mouline-logo en echte fotografie van mouline.be. De lokale versie staat op **http://localhost:3000/**.

Er was geen lokale Lovable-broncode of repository beschikbaar in deze werkmap. Daarom staat hier een zelfstandige, onderhoudbare lokale implementatie van de gevraagde verfijning. De gepubliceerde Lovable-site is niet gewijzigd.

## Starten

Node.js 22.13 of nieuwer en pnpm:

```sh
pnpm install
pnpm dev --host 127.0.0.1
```

`pnpm build` maakt de productiebuild. `pnpm exec tsc --noEmit` controleert de TypeScript-code.

## GitHub Pages

Live: [ildongato.github.io/Foodbar-Mouline](https://ildongato.github.io/Foodbar-Mouline/).

Elke push naar `main` bouwt en publiceert automatisch via `.github/workflows/pages.yml`.
De Pages-build gebruikt dezelfde React-componenten en rendert de inhoud vooraf naar HTML.
Foto’s, lettertypen en scripts gebruiken het pad `/Foodbar-Mouline/`.

```sh
pnpm build:pages
pnpm preview:pages
```

Open de preview op `http://127.0.0.1:4173/Foodbar-Mouline/`.
`dist-pages/` bevat uitsluitend de openbare statische website.
GitHub Pages ondersteunt geen serverroutes: het formulier maakt een e-mailaanvraag klaar
om zelf te versturen en de reviewsectie verwijst naar Google Maps. API-sleutels worden niet
meegebouwd. De bestaande serverroutes blijven beschikbaar bij hosting met serverondersteuning.

## Inhoud aanpassen

- `lib/business.ts`: centrale contactgegevens, openingsuren, route en Restaurant JSON-LD.
- `lib/data/onsite.json`: menu ter plaatse, inclusief ontbijt, lunch, zoet en dranken.
- `lib/data/takeaway.json`: afzonderlijke takeawaykaart en supplementen.
- `lib/data/photo-sources.json`: herkomst van de originele Mouline-fotografie.
- `components/`: navigatie, carrousel, menu, contactformulier, reviews en galerij.
- `app/globals.css`: vormgeving en alle responsive regels.

Elke menuregel behoudt `source`, `sourceName` en `sourcePrice`. De prijzen zijn overgenomen uit de officiële categoriepagina's, geraadpleegd op 7 september 2026. Er zijn geen prijzen uit de twee menustanden samengevoegd.

Bronnen:

- https://www.mouline.be/m-ontbijt.html
- https://www.mouline.be/m-lunch.html
- https://www.mouline.be/m-takeaway.html
- https://www.mouline.be/contact.html
- https://www.mouline.be/m-catering.html
- https://www.mouline.be/gallery.html

## Nog te bevestigen of te activeren

1. **Adres bevestigen.** `postalCode`, `city` en `addressVerified` moeten door de klant worden bevestigd. De opdracht noemt conflicterende gegevens: 2180 Ekeren en 2930 Brasschaat. Tot dan staat alleen de straat in de adresblokken; het volledige adres is nog niet opgenomen in JSON-LD. Het woord Ekeren in de redactionele tekst komt uit de aangeleverde briefing.
2. **Zondag en uitzonderingen bevestigen.** Maandag 9–16u, dinsdag tot vrijdag 8–16u en zaterdag gesloten komen van de officiële contactpagina. Zondag wordt niet als open of gesloten aangenomen. De dagweergave gebruikt de tijdzone Europe/Brussels en de reguliere openingsuren.
3. **Google-reviews koppelen.** Kopieer `.env.example` naar `.dev.vars` en voeg `GOOGLE_PLACES_API_KEY` en `GOOGLE_PLACE_ID` toe. De server haalt Place Details (New) op zonder de sleutel aan de browser bloot te stellen. Reviews worden niet gecachet en worden met auteursinformatie, datum, individuele bronlink en het officiële Google Maps-logo getoond. Zonder configuratie verschijnt een afgewerkt verwijzingsblok, geen verzonnen score of reviews. Ontwikkelnotities zijn alleen zichtbaar in development.
4. **E-mailverzending activeren.** Configureer `RESEND_API_KEY` en `CONTACT_FROM_EMAIL` met een geverifieerd verzenddomein. De ontvanger is centraal `info@mouline.be`. Zonder koppeling geeft de server 503 en biedt het formulier een mailprogramma-link met de ingevulde aanvraag. Het formulier simuleert geen succesvolle verzending. Een reservatie is nooit automatisch bevestigd.
5. **Twee menudetails bevestigen.** De takeawaytoeslag voor bruin brood vermeldt twee ongelabelde bedragen. Die worden niet geraden. De maat bij vers fruitsap is in de bron onduidelijk en wordt daarom weggelaten. Beide hebben een `todo` naast de bronwaarde. De Ice Tea-prijs gebruikt de takeawaypagina (€ 2,90), niet de afwijkende homepagevermelding (€ 2,80).
6. **Indexering activeren na controle.** De canonical is al https://www.mouline.be/. De tijdelijke Pages-versie en de lokale versie staan op `noindex, follow` in `app/layout.tsx` en `static-site/index.html`. Zet `index: true` pas voor de goedgekeurde productieversie. Laat de tijdelijke Lovable-preview buiten de index. Controleer het privacybeleid en de voorwaarden voor de geactiveerde diensten.

## Gedrag en controles

- Desktop en mobiel: aparte menustanden, eigen categorieën, prijzen in gewone HTML.
- Grote mobiele navigatie met focusbeheer en Escape; toegankelijke tabs met toetsenbordbediening.
- Visuele hero-carrousel met vaste headline, handmatige bediening, pauze en swipe.
- Reduced motion schakelt autoplay, intro en decoratieve animaties uit. De intro speelt hoogstens 700 ms en maar één keer per sessie.
- Catering selecteert automatisch het bijbehorende formulier. Er zijn afzonderlijke velden voor reservatie, catering en andere vragen.
- Servervalidatie, oorsprongscontrole, honeypot, beperkte berichtlengte, timeout en idempotente e-mailaanvragen.
- Alle foto's zijn lokaal geoptimaliseerd naar WebP met responsive formaten. Lettertypen zijn lokaal opgeslagen als WOFF2.
- Geen fictieve reviews, reviewster-schema, verzonnen coördinaten of ongecontroleerde postcode.

De optionele WebMCP-bedieningen `show_mouline_menu` en `start_mouline_contact` openen alleen een menustand of contactformulier. Ze bestellen of verzenden niets.

### Uitgevoerde controle

De productiebuild en TypeScript-controle slagen. De browsercontrole omvatte 320, 360, 390, 430, 768, 1024, 1280, 1440 en 1728 pixels: geen horizontale pagina-overloop of botsende namen/prijzen in het geteste menu. Mobiele navigatie, Escape en focusherstel, fotolightbox, cateringselectie, verschil tussen ter-plaatse- en takeawayprijzen, formulierfouten en de twee WebMCP-bedieningen zijn gecontroleerd. De API-controles bevestigen validatie, honeypot, oorsprongscontrole en eerlijke 503-foutmelding zonder verzendconfiguratie.

Google-reviews en echte e-mailbezorging kunnen pas met de juiste configuratie live worden getest. De Core Web Vitals-doelen en volledige WCAG 2.2 AA-conformiteit zijn geen gecertificeerde meetresultaten; meet deze aanvullend op de uiteindelijke productiehosting.
