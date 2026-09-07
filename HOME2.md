# Mouline — tweede ontwerp

Tijdelijke variant: https://ildongato.github.io/Foodbar-Mouline/home2/

Het oorspronkelijke ontwerp blijft op https://ildongato.github.io/Foodbar-Mouline/ staan.
Beide pagina’s worden vooraf als HTML gerenderd en gebruiken dezelfde bestaande menugegevens,
Google-reviewselectie, bedrijfsgegevens en contactlogica.

## Redactionele cover — navigatie en hero, 7 september 2026

De actuele bovenkant heeft een vaste navigatie met drie gelijke uitlijnzones:
Menu, Over, Catering en Contact links, het bestaande logo exact in het midden van
de viewport, en Takeaway rechts. Het grid gebruikt gelijke buitenkolommen.
De header is 84 px hoog op desktop en 72 px op mobiel. Onder 360 px staat
Takeaway alleen in het geopende menu, zodat logo en aanraakvlakken ruim blijven.
De overige sectielinks blijven in de mobiele navigatie beschikbaar.

‘Van ontbijt tot lunch.’ staat in bourgondische Instrument Serif op ivoor,
naast de bestaande korte toelichting en ‘Bekijk de kaart’. Daaronder staat
één statische, heldere interieurfoto over de volle viewportbreedte. De bestaande
800/1600 px WebP-bronnen en preload blijven behouden. Overlay, carrouselteller,
pijlen, swipegedrag en achterhaalde hero-CSS zijn verwijderd. De galerij behoudt
haar eigen beelden en bediening. Er is bewust geen titeloverlap: de strakke
scheiding houdt het interieurbeeld rustig en de titel volledig leesbaar.

Mobiel volgen titel, toelichting, kaartlink en een hogere foto-uitsnede elkaar
op. Een lage desktopviewport krijgt minder titelpadding; de foto blijft groot.
De titel en foto zijn direct zichtbaar, zonder entreeanimatie. De bestaande
hover-, focus- en reduced-motionregels blijven de bediening verzorgen.

De tweede visuele pass controleerde de beeldverhoudingen, regelafbrekingen en
uitlijning; het desktopklikvlak van Kaart is daarbij minimaal 44 px breed gemaakt.
Kaart en de hero-link openen ter plaatse; Takeaway opent daadwerkelijk de
takeawaystand. Alle ankers blijven onder de vaste navigatie zichtbaar.

### Controle van de cover

- Screenshots vóór en na op desktop en mobiel; definitieve visuele controle
  op 360, 390, 768, 1024 en 1440 px, plus 320 px en 1440 × 650 px.
  De logomiddellijn wijkt op alle vijf standaardbreedtes 0 CSS-pixels af van
  het viewportmidden. Eén h1, één heroafbeelding, geen horizontale overloop.
- Bij 1440 × 1000 px is de titelzone 197 px en de foto 580 px hoog.
  Bij 1440 × 650 px is dat 153 en 377 px. Op 390 px blijft de foto 359 px hoog.
- Desktopnavigatie, beide menustanden, alle zes mobiele sectieankers, de
  Takeaway-actie op 320 px, toetsenbordactivatie, tabfocus binnen het mobiele
  menu, Escape en focusherstel zijn getest. Sticky categoriebediening blijft
  op 72 px onder de mobiele header; na een toetsenbordwissel op circa 80 px.
- De hoverpijl schuift gemeten 3 px op; het knopvlak verandert niet van positie
  of grootte. De galerij opent, wisselt met de pijltjestoets en sluit met
  Escape met focusherstel. Geen consolewaarschuwingen of fouten in de preview.
- Inhoud, breedtes en hoogtes van alle overige secties zijn op de vijf breedtes
  gelijk aan de nulmeting. De componentcode vanaf de praktische strook en de
  bestaande hoofdsectiestyling zijn ongewijzigd. De oorspronkelijke homepage
  heeft dezelfde bronbestanden en dezelfde SSR-inhoud na normalisatie van
  gegenereerde assetnamen. Gedeelde menu-, review- en bedrijfsdata zijn gelijk.
- `pnpm build`, `pnpm build:pages`, `pnpm exec tsc --noEmit`,
  `pnpm exec oxlint components/home2` en `git diff --check` slagen.
  Volledige lint: dezelfde 32 bestaande diagnostieken.
- De browserbediening biedt geen systeememulatie voor reduced motion.
  De bestaande mediaregels, nulduur-tokens en uitgeschakelde pijltransforms zijn
  in CSS gecontroleerd; omschakelen van de systeemvoorkeur is niet getest.

Gewijzigd: `components/home2/mouline.tsx`, `app/home2/home2.css` en dit document.
Geen nieuwe fonts, foto's, dependencies of hostingwijzigingen.

## Bistrodetails — gerichte verfijning, 7 september 2026

Alleen home2 is verfijnd. Het compacte taupe reviewvlak draagt een statisch paar
bourgondische haarlijnen: 1 px breed, tweede lijn op 4 px, herhaald om de 24 px,
met 7% dekking. Dezelfde geometrie keert eenmaal terug in een 16 px hoge strook
bovenaan de footer, daar in ivoor op espresso. Beide sectiehoogtes blijven gelijk.

Een lokaal, naadloos SVG-papiertile ligt met 2,5% dekking uitsluitend onder de
inhoud van ‘Aangenaam, Mouline’. De bestaande portretuitsnede blijft behouden.
De zes eigen culinaire SVG-tekeningen delen een 24-punts viewBox en 1,5-punts
ronde penlijn. Ze staan op desktop op 22 px naast de categorietabs; op mobiel
blijven de tabs tekstueel en verschijnt één icoon van 30 px bij de actieve titel.
De mapping gebruikt bestaande categorie-ID’s en wijzigt geen menugegevens.

Twee dubbele haarlijnen sluiten het menublok af. In de tweede visuele pass zijn
concurrerende randen verwijderd, de broodjesillustratie platter gemaakt en de
mobiele tabs op minimaal 44 × 48 px gebracht. Actiepijlen schuiven bij hover
3 px op via het bestaande motiontoken; reduced-motion schakelt dit uit.
De echte logogeometrie is bekeken voor catering, maar een watermerk zou de vrije
ruimte vullen en het vlak drukker maken. Daarom blijft catering effen.

Gewijzigd voor deze verfijning: `app/home2/home2.css`,
`components/home2/culinary-icon.tsx`, `components/home2/menu-section.tsx`,
`components/home2/mouline.tsx`, `public/images/home2-paper.svg` en dit document.
Er zijn geen dependencies of wijzigingen aan gedeelde data, contactlogica,
hostingconfiguratie of de oorspronkelijke bronbestanden toegevoegd.

### Controle van deze verfijning

- Nulmeting van desktop en mobiel vastgelegd. De volledige nieuwe pagina is
  visueel gecontroleerd op 360, 390, 768, 1024 en 1440 px; reflow ook op 320 px.
  Geen horizontale pagina-overloop. Reviewhoogte op desktop blijft 293,35 px.
- Alle zes categorieën ter plaatse en alle vijf takeawaycategorieën doorlopen
  op 390 en 1440 px. Geen botsingen tussen namen en prijzen; iconen hebben de
  bedoelde formaten en staan op mobiel niet dubbel in beeld.
- Supplementen, horizontale categoriebediening, sticky positie, native
  pijltjestoets/Enter-bediening, mobiele navigatie, Escape en focusherstel getest.
- Alle zes lightboxbeelden geladen. Cateringselectie, lege formuliervalidatie,
  andere vraag, reservatie en het aanmaken van een mailto-concept gecontroleerd.
  Er is geen e-mail verstuurd. De route opent de juiste Foodbar Mouline-vermelding.
- De oorspronkelijke homepage is voor en na visueel vergeleken op desktop en
  mobiel. De vooraf gerenderde inhoud is gelijk na normalisatie van gegenereerde
  assetnamen; checksums van de oorspronkelijke bronbestanden en gedeelde data
  zijn gelijk. Menuwissels, supplementen, mobiele navigatie, lightbox en catering
  werken ook op de oorspronkelijke pagina.
- Op de samengestelde reviewachtergrond is het laagste gemeten tekstcontrast
  6,93:1; de bourgondische sterren komen op 4,54:1. Inactieve categorietekst op
  wit haalt 5,28:1. Decoratieve lagen onderscheppen geen klikken.
- `pnpm build`, `pnpm build:pages`, `pnpm exec tsc --noEmit`,
  `pnpm exec oxlint components/home2` en `git diff --check` slagen.
  De volledige `pnpm lint` blijft dezelfde 32 bestaande fouten melden.
  De gecontroleerde statische browserpreview meldt geen consolefouten.
- 200% tekstvergroting en het omschakelen van de systeemvoorkeur voor minder
  beweging zijn niet ondersteund door de beschikbare browserbediening en dus
  niet als geslaagde praktijktest aangemerkt. De bijbehorende CSS is nagekeken.

## Ontwerp

De oorspronkelijke compositie combineerde een zeer grote kop met een losse fotolens,
veel lichte hoofdstukken en een grillige galerij. Home2 gebruikt een gecentreerd logo,
een bourgondische titel op ivoor en één statische, brede interieurfoto. Op mobiel
staan titel, toelichting en kaartlink boven de foto.

De witte menukaart heeft een duidelijke hiërarchie tussen menustand, categorie en gerecht.
Alleen de categorieën blijven tijdens het lezen vaststaan. Instrument Serif draagt de
koppen; DM Sans verzorgt bediening, informatie en gerechten. De inhoud volgt één grid
van maximaal 1280 px. De galerij heeft één hoofdbeeld en vijf ondersteunende foto’s.
Bourgondisch draagt de cateringsectie; espresso sluit de pagina af.

De tweede visuele pass verfijnde kopafbrekingen, reviewafstand en bronleesbaarheid,
catering op tablet en de contactcompositie tussen 651 en 800 px. Tijdens de interactietest
zijn de mobiele dialoogpositie en de scrollpositie na een categoriewissel hersteld.
De motionregels gebruiken centrale tijdsduren en expliciete reduced-motionregels.

De aangeleverde portretfoto vervangt het sfeerbeeld bij ‘Aangenaam, Mouline’.
Twee lokale WebP-formaten behouden het volledige origineel; de browser bepaalt de
uitsnede. Een vaste beeldverhouding van 4:3 en focus op `50% 18%` houden gezicht en
begroetende hand in beeld op desktop, tablet en mobiel. De eerdere brede tabletuitsnede
is hiervoor verwijderd. Visueel gecontroleerd op 390, 768 en 1440 px; Pages-build,
TypeScript, gerichte lint en diffcontrole slagen.

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

## Compacter contactformulier — 7 september 2026

Het contactgedeelte heeft kleinere telefoon- en e-maillinks (18 px), minder verticale
tussenruimte en compacte velden met een rustige, rechte omlijning. Labels staan
4 px boven hun veld; invoervelden blijven 44 px hoog met 16 px invoertekst. Naam,
contactgegevens en aanvraagdetails zijn logisch gegroepeerd, met behoud van de
bestaande DOM- en toetsenbordvolgorde. Op mobiel krijgen naam, e-mail, telefoon en
datum de volle breedte. Tablet toont de contactgegevens en openingsuren naast elkaar,
met het formulier daaronder. Alle CSS blijft beperkt tot home2.

De reservatievorm is op 1440 px van 708 naar 575 px hoog gegaan (circa 19% korter),
op 390 px van 1029 naar 856 px (circa 17%). Gecontroleerd op 320, 360, 390, 768, 1024
en 1440 px zonder horizontale pagina-overloop. Reservatie, catering en andere vraag
gecontroleerd; een leeg cateringformulier toont leesbare fouten en focust Naam.
Een geldige lokale aanvraag bereidt het bestaande mailto-concept voor; niets verzonden.
De gedeelde formulierlogica, contactgegevens en oorspronkelijke homepage zijn ongewijzigd.

TypeScript, gerichte home2-lint, reguliere build, Pages-build en diffcontrole slagen.
De browser meldt geen consolewaarschuwingen of fouten tijdens deze controle.

## Bestanden

- `components/home2/mouline.tsx`: compositie, statische cover, galerij en navigatie.
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

## Eerdere controle op 7 september 2026, vóór de statische cover

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
