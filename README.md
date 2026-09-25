# Foodbar Mouline

De goedgekeurde Mouline-website staat op [ildongato.github.io/Foodbar-Mouline](https://ildongato.github.io/Foodbar-Mouline/). Er is één ontwerp. De oude `/home1/`, `/home2/` en `/home3/`-links sturen door naar de hoofdlink met behoud van queryparameters en ankers.

## Starten en publiceren

Node.js 22.13+ en pnpm:

```sh
pnpm install
pnpm dev --host 127.0.0.1
pnpm exec tsc --noEmit
pnpm build:pages
pnpm preview:pages
```

De statische preview staat standaard op `http://127.0.0.1:4173/Foodbar-Mouline/`. Een push naar `main` bouwt en publiceert via `.github/workflows/pages.yml`. Alleen de goedgekeurde homepage wordt gebouwd; de eerdere ontwerpen zijn beschikbaar in de Git-geschiedenis.

## Goedgekeurde tijdelijke demo’s

- `closureDemoEnabled` in `lib/closures.ts`: toont de sluitingsmelding als demo. Met `false` volgt de melding alleen de ingestelde feestdagen, brugdagen en vakantie in de tijdzone Europe/Brussels.
- `contactDemoEnabled` in `lib/contact-delivery.ts`: het formulier toont validatie, laadstatus en bevestiging zonder e-mail te verzenden. Deze flag staat op `true` met goedkeuring van de klant. De zichtbare testtekst is op verzoek verwijderd. Zet op `false` na aansluiting en controle van de echte mailkoppeling. Een expliciete `?formDemo=1`-link blijft dan beschikbaar voor visuele tests.

Echte verzending vereist `NEXT_PUBLIC_CONTACT_ENDPOINT`, lokaal en in de GitHub Actions Variables. De adapter ondersteunt Formspree en de eigen hosting. Zie [hosting/README.md](hosting/README.md) voor de bestaande PHP-optie. Er is nog geen endpoint ingesteld. Zonder endpoint en met de demo uit meldt het formulier dat verzending niet beschikbaar is; een reservatie wordt nooit automatisch bevestigd.

## Inhoud en vormgeving

- `components/home3/`: de definitieve sitecomponenten; de interne mapnaam blijft behouden.
- `app/home3/home3.css`: kleur-, typografie-, spacing- en responsive regels.
- `lib/business.ts`: contactgegevens, openingsuren en Restaurant JSON-LD.
- `lib/data/onsite.json` en `lib/data/takeaway.json`: strikt gescheiden menukaarten.
- `lib/home3-gallery.ts`: vijftien galerijfoto’s en gecureerde sessiesets van zes beelden. Het wuivende portret van Caroline staat uitsluitend bij Over Mouline.
- `lib/data/google-reviews.json`: handmatig gecontroleerde Google-citaten met bronlinks.
- `lib/closures.ts`: uitzonderlijke sluitingen en demoflag.
- `components/home3/jobs.tsx`: de twee vacatures; de navigatie gebruikt `#vacatures`.

Garnaalsla ter plaatse kost € 8,40, bevestigd op 25 september 2026. De takeawaykaart blijft onafhankelijk (€ 6,80). Canonical en sitemap verwijzen naar `https://www.mouline.be/`; de GitHub-weergave blijft `noindex, follow` totdat de definitieve domeinhosting is bevestigd.

## Controle

```sh
pnpm exec tsc --noEmit
node scripts/check-closures-and-contact.mjs
pnpm build:pages
node scripts/check-pages.mjs
```

De build rendert inhoud vooraf naar HTML. Lokale WebP-afbeeldingen en WOFF2-fonts gebruiken het Pages-basispad. Navigatie en lightbox ondersteunen toetsenbordbediening, focusherstel en reduced motion. Zie [SITE-UPDATE-2026-09-24.md](SITE-UPDATE-2026-09-24.md) voor de details en nog benodigde configuratie.

## Bestaande DirectAdmin-hosting

De geïsoleerde testdeployment en echte PHP-formulieren staan beschreven in
[hosting/DEPLOYMENT.md](hosting/DEPLOYMENT.md). Pushes naar `main` publiceren alleen
naar `https://www.mouline.be/nieuw/`; de bestaande productie-root blijft intact.
