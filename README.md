# Foodbar Mouline

Een Nederlandse onepage voor Foodbar Mouline, met het bestaande Mouline-logo en echte fotografie van mouline.be. De visuele richting combineert Instrument Serif en DM Sans met ivoor, espresso en een enkel bourgondisch cateringmoment. De lokale versie staat op **http://localhost:3000/**.

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

Tweede ontwerp: [tijdelijke home2](https://ildongato.github.io/Foodbar-Mouline/home2/).
De oorspronkelijke homepage blijft op de hoofdlink staan. Lokaal is de tweede variant
beschikbaar op `http://localhost:3000/home2`; de statische preview op
`http://127.0.0.1:4173/Foodbar-Mouline/home2/`.
Zie [HOME2.md](HOME2.md) voor de ontwerpkeuzes, gewijzigde bestanden en controlebeperkingen.

Elke push naar `main` bouwt en publiceert automatisch via `.github/workflows/pages.yml`.
De Pages-build gebruikt dezelfde React-componenten en rendert de inhoud vooraf naar HTML.
Foto’s, lettertypen en scripts gebruiken het pad `/Foodbar-Mouline/`.

```sh
pnpm build:pages
pnpm preview:pages
```

Open de preview op `http://127.0.0.1:4173/Foodbar-Mouline/`.
`dist-pages/` bevat uitsluitend de openbare statische website.
GitHub Pages ondersteunt geen serverroutes. Home en Home2 maken daarom een
e-mailaanvraag klaar om zelf te versturen. Home3 gebruikt rechtstreekse verzending
via de bestaande PHP-hosting; activering en de openbare endpoint-instelling staan in
[hosting/README.md](hosting/README.md). Tot deze koppeling actief is, meldt Home3
dat verzending niet beschikbaar is. De reviewsectie toont drie handmatig gecontroleerde Google-citaten
met sterren, directe bronlinks en een raadpleegdatum. API-sleutels worden niet
meegebouwd. De bestaande serverroutes blijven beschikbaar bij hosting met serverondersteuning.

## Inhoud aanpassen

- `lib/business.ts`: centrale contactgegevens, openingsuren, route en Restaurant JSON-LD.
- `lib/data/onsite.json`: menu ter plaatse, inclusief ontbijt, lunch, zoet en dranken.
- `lib/data/takeaway.json`: afzonderlijke takeawaykaart en supplementen.
- `lib/data/photo-sources.json`: herkomst van de originele Mouline-fotografie.
- `lib/data/google-reviews.json`: drie letterlijke reviewfragmenten met hun Google-bronlinks, vijfsterrenbeoordelingen en controledatum. De algemene score (4,4 uit 136 beoordelingen) is op 7 september 2026 op Google Maps gecontroleerd. Werk deze gedateerde selectie handmatig bij wanneer nodig.
- `components/`: navigatie, carrousel, menu, contactformulier, reviews en galerij. De inhoudelijke menugegevens blijven gescheiden van de vormgeving.
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
3. **Live Google-reviews koppelen (optioneel).** Kopieer `.env.example` naar `.dev.vars` en voeg `GOOGLE_PLACES_API_KEY` en `GOOGLE_PLACE_ID` toe. De server haalt Place Details (New) op zonder de sleutel aan de browser bloot te stellen. API-reviews worden niet gecachet en worden met auteursinformatie, datum, individuele bronlink en het officiële Google Maps-logo getoond. Zonder configuratie, bij een fout en op GitHub Pages blijft de handmatig gecontroleerde selectie uit `lib/data/google-reviews.json` zichtbaar. De zichtbare raadpleegdatum maakt duidelijk dat deze selectie niet live wordt bijgewerkt. Bij een werkende serverkoppeling worden drie beschikbare reviews uit de API gebruikt.
4. **E-mailverzending activeren.** Configureer `RESEND_API_KEY` en `CONTACT_FROM_EMAIL` met een geverifieerd verzenddomein. De ontvanger is centraal `info@mouline.be`. Zonder koppeling geeft de server 503 en biedt het formulier een mailprogramma-link met de ingevulde aanvraag. Het formulier simuleert geen succesvolle verzending. Een reservatie is nooit automatisch bevestigd.
5. **Twee menudetails bevestigen.** De takeawaytoeslag voor bruin brood vermeldt twee ongelabelde bedragen. Die worden niet geraden. De maat bij vers fruitsap is in de bron onduidelijk en wordt daarom weggelaten. Beide hebben een `todo` naast de bronwaarde. De Ice Tea-prijs gebruikt de takeawaypagina (€ 2,90), niet de afwijkende homepagevermelding (€ 2,80).
6. **Indexering activeren na controle.** De canonical is al https://www.mouline.be/. De tijdelijke Pages-versie en de lokale versie staan op `noindex, follow` in `app/layout.tsx` en `static-site/index.html`. Zet `index: true` pas voor de goedgekeurde productieversie. Laat de tijdelijke Lovable-preview buiten de index. Controleer het privacybeleid en de voorwaarden voor de geactiveerde diensten.

## Gedrag en controles

- Desktop en mobiel: aparte menustanden, eigen categorieën, prijzen in gewone HTML.
- Grote mobiele navigatie met focusbeheer en Escape; toegankelijke tabs met toetsenbordbediening.
- Redactionele fotoreeks met vaste headline, vier echte foto’s, een kleine lens als preview, teller, toetsenbordbediening en swipe. Automatisch afspelen staat standaard uit en kan bewust worden gestart.
- Reduced motion schakelt afspelen en overgangen uit. Er is geen intro-loader, scrollanimatie of parallax. Navigatie reageert direct.
- Catering selecteert automatisch het bijbehorende formulier. Er zijn afzonderlijke velden voor reservatie, catering en andere vragen.
- Servervalidatie, oorsprongscontrole, honeypot, beperkte berichtlengte, timeout en idempotente e-mailaanvragen.
- Alle foto's zijn lokaal geoptimaliseerd naar WebP met responsive formaten. Lettertypen zijn lokaal opgeslagen als WOFF2.
- Geen fictieve reviews, reviewster-schema, verzonnen coördinaten of ongecontroleerde postcode.

De optionele WebMCP-bedieningen `show_mouline_menu` en `start_mouline_contact` openen alleen een menustand of contactformulier. Ze bestellen of verzenden niets.

### Uitgevoerde controle

De productiebuild en TypeScript-controle slagen. Na de herontwerppass zijn de beeldcompositie, typografische hiërarchie, menu’s, mobiele navigatie en het contactformulier opnieuw visueel gecontroleerd op desktop en mobiel. De browsercontrole omvatte 320, 360, 390, 430, 768, 1024, 1280, 1440 en 1728 pixels: geen horizontale pagina-overloop of botsende namen/prijzen in het geteste menu. Mobiele navigatie, Escape en focusherstel, fotolightbox, cateringselectie, verschil tussen ter-plaatse- en takeawayprijzen, formulierfouten en de twee WebMCP-bedieningen zijn gecontroleerd. De API-controles bevestigen validatie, honeypot, oorsprongscontrole en eerlijke 503-foutmelding zonder verzendconfiguratie.

De automatische Google-koppeling en echte e-mailbezorging kunnen pas met de juiste configuratie live worden getest. De drie statische Google-citaten zijn rechtstreeks in Google Maps gelezen en met screenshots gecontroleerd; de sterren, namen en reviewlinks zijn overgenomen uit die bron. De Core Web Vitals-doelen en volledige WCAG 2.2 AA-conformiteit zijn geen gecertificeerde meetresultaten; meet deze aanvullend op de uiteindelijke productiehosting.
