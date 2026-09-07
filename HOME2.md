# Mouline — tweede ontwerp

Tijdelijke variant: https://ildongato.github.io/Foodbar-Mouline/home2/

Het oorspronkelijke ontwerp blijft op https://ildongato.github.io/Foodbar-Mouline/ staan.
Beide pagina’s worden vooraf als HTML gerenderd en gebruiken dezelfde bestaande menugegevens,
Google-reviewselectie, bedrijfsgegevens en contactlogica.

## Ontwerp

De oorspronkelijke compositie combineerde een zeer grote kop met een losse fotolens,
veel lichte hoofdstukken en een grillige galerij. Home2 gebruikt een brede interieurfoto,
een vaste boodschap en twee eerlijke kaartacties. Op mobiel staan tekst en acties onder
de foto. De vier foto’s wisselen alleen op verzoek.

De witte menukaart heeft een duidelijke hiërarchie tussen menustand, categorie en gerecht.
Alleen de categorieën blijven tijdens het lezen vaststaan. Instrument Serif draagt de
koppen; DM Sans verzorgt bediening, informatie en gerechten. De inhoud volgt één grid
van maximaal 1280 px. De galerij heeft één hoofdbeeld en vijf ondersteunende foto’s.
Bourgondisch draagt de cateringsectie; espresso sluit de pagina af.

De tweede visuele pass verfijnde kopafbrekingen, reviewafstand en bronleesbaarheid,
catering op tablet en de contactcompositie tussen 651 en 800 px. Tijdens de interactietest
zijn de mobiele dialoogpositie en de scrollpositie na een categoriewissel hersteld.
De motionregels gebruiken centrale tijdsduren en expliciete reduced-motionregels.

## Compacte reviews en locatiekaart — 7 september 2026

De aanvullende verfijning gebruikt een compact taupe reviewvlak met uitsluitend de
drie bestaande, geverifieerde citaten, sterren en auteurs. De namen linken discreet
naar hun individuele Google-review. Het gemiddelde, aantal beoordelingen, bovenlabel,
de aparte Google-CTA's en voetinformatie zijn verwijderd uit home2. De raadpleegdatum
en bronverantwoording blijven in de gedeelde JSON bewaard. Op mobiel staan sterren en
naam op één regel; op desktop blijven de drie citaten naast elkaar staan.

Naast het adres staat een lokaal geladen, geografisch correct kaartbeeld in ivoor en
taupe, met een bourgondische Mouline-markering. Mobiel gebruikt een aparte uitsnede.
De kaart opent de bestaande Google Maps-bestemming en voegt geen live kaartservice,
API-sleutel, tracking of dependency toe. Het straatbeeld komt uit OpenStreetMap;
de brongeometrie, ODbL-vermelding en reproduceerbare renderer zijn meegeleverd in
`public/maps/` en `scripts/render-location-map.mjs`.

De gewijzigde secties zijn visueel gecontroleerd op 320, 360, 390, 768, 1024 en 1440 px.
De kaartlabels zijn in een tweede pass aangepast aan de mobiele uitsnede. Geen
horizontale overloop in de gecontroleerde breedtes. De kaartlink is met het toetsenbord
geopend en komt uit op de juiste Google-vermelding; de focusrand blijft zichtbaar.
De statische preview heeft geen consolewaarschuwingen of fouten gemeld.
TypeScript, gerichte lint, reguliere build, Pages-build en diffcontrole slagen.
De oorspronkelijke homepage en gedeelde bedrijfs-, menu- en reviewgegevens zijn niet gewijzigd.

## Bestanden

- `components/home2/mouline.tsx`: nieuwe compositie, handmatige hero, galerij en navigatie.
- `components/home2/menu-section.tsx`: aparte presentatie van de gedeelde menukaarten.
- `app/home2/page.tsx` en `app/home2/home2.css`: lokale route en zelfstandig stylesysteem.
- `app/layout.tsx` en `app/page.tsx`: verplaatsen van de oorspronkelijke CSS en fotopreload
  naar de oorspronkelijke route, zodat home2 geen oude homepage-overrides laadt.
- `static-site/home2/index.html`, `static-site/home2/main.tsx`,
  `static-site/entry-server.tsx`, `vite.pages.config.ts` en `scripts/build-pages.mjs`:
  twee afzonderlijke, vooraf gerenderde Pages-ingangen.
- `components/contact-form.tsx`: uitsluitend een spatie toegevoegd bij een regelafbreking,
  zodat de compacte home2-weergave geen woorden samenvoegt.

De bestaande `components/mouline.tsx`, `app/globals.css`, menuprijzen, reviewdata,
bedrijfsgegevens, API-routes, dependencies en hostingconfiguratie zijn inhoudelijk behouden.
Noindex, canonical en bestaande verificatienotities zijn niet geactiveerd of ingevuld.

## Controle op 7 september 2026

- De volledige compositie is in de browser bekeken op 320, 360, 390, 768, 1024, 1440
  en 1728 px. Geen horizontale pagina-overloop op deze breedtes.
- Beide menustanden en alle elf categorieën doorlopen op 360 px; focus blijft op de
  gekozen categorie. Pijltjes/Home verplaatsen tabfocus; Enter activeert de categorie.
  Bij wisselen vanuit de vaste categoriebediening komt de kaart onder de header terug.
  Geen botsing tussen gerechtnamen en prijzen in deze controle.
- Afzonderlijke broodjesprijzen bevestigd: kaas of hesp € 5,80 ter plaatse en € 4,50 takeaway.
- Alle zes galerijbeelden geopend; Escape sluit de lightbox en herstelt de focus.
  Mobiele navigatie, Escape, focusherstel en ankers zijn interactief getest.
- Alle vier herofoto’s en hun pijltjestoetsen getest; boodschap en acties blijven gelijk.
- Catering selecteert de juiste aanvraagvelden. Leeg indienen toont veldfouten en focust
  het eerste ongeldige veld. Andere vraag toont alleen de relevante velden.
  Een geldige Pages-aanvraag maakt uitsluitend een correct geadresseerd mailto-concept;
  er is geen e-mail verstuurd en er wordt geen verzending of reservatie bevestigd.
- Telefoon- en e-maildoelen, beide WebMCP-bedieningen en de afwezigheid van consolefouten
  in de geteste statische preview gecontroleerd.
- Lokale routes `/` en `/home2` gecontroleerd. Home2 laadt uitsluitend zijn eigen CSS
  en gebruikt daadwerkelijk de twee bedoelde fontfamilies.
- `pnpm build`, `pnpm build:pages`, `pnpm exec tsc --noEmit` en `git diff --check` slagen.
  De statische HTML heeft per pagina één h1, noindex, de bestaande canonical en werkende
  lokale assetpaden onder `/Foodbar-Mouline/`.
- De gerichte lintcontrole van de nieuwe presentatie, routes en Pages-buildbestanden slaagt.
  `pnpm lint` voor de hele bestaande repository meldt 32 bestaande fouten, onder meer in
  de meegeleverde UI-primitives, de oorspronkelijke homepage en de gedeelde contact- en
  reviewcomponenten. Die zijn niet als onderdeel van deze ontwerpvariant herschreven.

## Grenzen van de controle

De browserbediening ondersteunt hier geen werkende zoomtoets of media-emulatie voor
`prefers-reduced-motion`. Reflow op 320 px is daadwerkelijk getest; 200% tekstvergroting
en het omschakelen van de systeemvoorkeur zijn niet getest. De reduced-motion-CSS en
de bijbehorende logica zijn wel gecontroleerd, inclusief het uitschakelen van de
specifiekere animatieregels. Dit is geen volledige WCAG-audit of Core Web Vitals-veldmeting.
Echte e-mailbezorging en de optionele live Google-API vereisen de bestaande configuratie.

De automatische full-page-export van de browser produceerde dubbele stroken. Daarom
zijn de volledige desktop- en mobiele screenshots samengesteld uit overlappende, normale
browseropnames op hun gemeten scrollposities. Detailopnames zijn onbewerkte browsercaptures.
