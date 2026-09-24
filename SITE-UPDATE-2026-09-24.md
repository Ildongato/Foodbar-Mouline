# Mouline — lokale update van 24 september 2026

## Configuratie die nog nodig is

- **Sluitingsdemo:** `closureDemoEnabled` in `lib/closures.ts` staat bewust op `true`. Zet uitsluitend deze flag op `false` na visuele goedkeuring. Dan toont de melding alleen op de tien wettelijke feestdagen, de opgegeven brugdagen en 19–30 juli. Demo-inhoud wordt nooit gebruikt voor de productiekalender. De kalender gebruikt Europe/Brussels; aangrenzende sluitingsdagen worden samengevoegd. Gewone zaterdag-/zondaguren worden niet als nieuwe uitzonderingen geïnterpreteerd en er wordt geen onbevestigde heropeningsdag beloofd.
- **Garnaalsla ter plaatse:** vul uitsluitend `price` in bij Garnaalsla in `lib/data/onsite.json`. Deze staat nu op `null`, met een lege prijsplaceholder. De takeawaykaart is ongewijzigd.
- **Formspree:** er is nog geen echt endpoint beschikbaar. Maak één formulier aan, verifieer `info@mouline.be` als ontvanger en kopieer het endpoint naar `NEXT_PUBLIC_CONTACT_ENDPOINT` (`.env.local` lokaal; dezelfde GitHub Actions Variable voor Pages). Vervolgens opnieuw bouwen. Geen geheime API-sleutel nodig. `email` bepaalt Reply-To; `_gotcha` is de spamval. Houd de server-side spamfiltering aan. Zonder endpoint toont het formulier een eerlijke foutmelding en blijven de gegevens behouden. Werkelijke e-mailbezorging en de ontvanger kunnen pas na deze configuratie worden geverifieerd.
- **Productiedomein:** bestaande canonical `https://www.mouline.be/` behouden, Open Graph daarmee gelijkgetrokken. `public/sitemap.xml` bevat alleen die URL. De GitHub-weergave blijft `noindex, follow`; indexering pas aanzetten wanneer de definitieve domein-/routekeuze bevestigd is. Bij verhuizing moeten de build base path, de afbeelding-URL's en indexeringsinstellingen bij die host passen. `robots.txt` laat crawlen toe, zodat de paginametadata leesbaar blijft. Op GitHub-projecthosting staat robots.txt onder het projectpad; alleen het robots.txt op de domeinroot heeft voor crawlers autoriteit.

## Definitieve website en goedgekeurde demo’s

- De goedgekeurde versie staat op `/`. Home1, Home2 en Home3 sturen door naar dezelfde homepage en behouden queryparameters en ankers. De aparte vacaturepreview stuurt eveneens door; de goedgekeurde styling staat nu in de hoofdstylesheet. Oude ontwerpcomponenten en stylesheets zijn verwijderd; de Git-geschiedenis bewaart ze.
- `contactDemoEnabled` in `lib/contact-delivery.ts` staat op `true`, zoals expliciet goedgekeurd voor publicatie. Het formulier doorloopt validatie, laadstatus en bevestiging zonder een mailservice aan te roepen. De zichtbare testvermelding is op verzoek verwijderd. Zet deze flag op `false` wanneer het echte endpoint is aangesloten. `?formDemo=1` blijft dan beschikbaar voor expliciete tests.

## Verificatie

- **Navigatie:** `Vacatures` verwijst in header en hamburgermenu naar `#vacatures`, tussen Catering en Contact. De goedgekeurde vacaturestyling is opgenomen: bestaande titelschaal, uitgelijnde sollicitatielinks en twee kolommen tot 440 px.

- TypeScript, gerichte lintcontrole en statische Pages-build geslaagd.
- `node scripts/check-closures-and-contact.mjs`: tien unieke feestdagen, beweeglijke feestdagen 2026/2027, vakantiegrenzen, Brusselse datumgrenzen, brugdagen, demo-isolatie, Formspree-payload, Reply-To, honeypot, succes, server-/netwerkfouten en behoud van invoer.
- Desktop 1440 px, iPad landscape 1180 px en mobiel 390 px bekeken. Menu-switcher desktop/iPad op 24 px naast de titel; mobiele stapeling behouden. Alle categorieën van beide menumodi op desktop en mobiel bediend, zonder horizontale pagina-overloop.
- Sluitingsmelding: herladen, Escape en buitenklik gecontroleerd; reduced-motion CSS aanwezig.
- Formulier: validatiefouten, serverfout en successtatus met een tijdelijke lokale testontvanger gecontroleerd. Er is geen echte e-mail verstuurd. De goedgekeurde publicatie bevat de afzonderlijk schakelbare formulierdemo; de echte verzendfunctie blijft zonder endpoint een fout teruggeven.
- Takeawaybestand en afbeeldingsbestanden behouden. De drie eerder verwijderde foto's het wuivende portret van Caroline en de foto bij de koffiemachine zijn uit de galerijpool/sets verwijderd. Het portret blijft uitsluitend bij Over Mouline; de lightbox bevat 15 beelden en de homepage blijft zes beelden tonen.
- SSR gecontroleerd: bestaande inhoud, vacatures en menu aanwezig in HTML; geen 2018; lokale afbeeldingspaden en interne links geldig; afbeeldingen hebben alt/width/height. Restaurant JSON-LD syntactisch geldig en vereiste naam/adresvelden aanwezig. Geen Review/AggregateRating of JobPosting op de homepage. Geen Google Rich Results live-test uitgevoerd voor de lokale preview.
- Geen consolewaarschuwingen of fouten in de gecontroleerde lokale homepage. De tijdelijke formulier-testserver produceert opzettelijk één HTTP 503 voor de fouttest.

## Geraadpleegde primaire bronnen

- [Belgium.be — wettelijke feestdagen](https://www.belgium.be/nl/over_belgie/land/belgie_in_een_notendop/feestdagen)
- [Formspree — Reply-To via email](https://help.formspree.io/articles/building-your-form/email-reply-to-address)
- [Formspree — honeypot](https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering)
- [Formspree — AJAX-formulieren](https://help.formspree.io/articles/building-your-form/submit-forms-with-javascript-ajax)
- [Google — lokale bedrijfsgegevens](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google — canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google — AI Search](https://developers.google.com/search/docs/appearance/ai-features)
- [Google — vacatures](https://developers.google.com/search/docs/appearance/structured-data/job-posting)
- [Mouline — officieel adres en uren](https://www.mouline.be/contact.html), opnieuw gecontroleerd op 24 september 2026; postcode 2180 en Ekeren alleen toegevoegd aan technische metadata, zonder zichtbare adrescopy te wijzigen.
