import { staticHosting } from './hosting';

/** Single source for business information. Checked against official pages on 2026-09-07.
 * TODO CLIENT VERIFICATION: 2180 Ekeren vs 2930 Brasschaat. No postal code/locality
 * is emitted until confirmed. Ekeren in editorial copy is the client-requested area.
 * TODO CLIENT VERIFICATION: Sunday hours and holiday exceptions are unpublished.
 */
export const business = {
  name: 'Foodbar Mouline',
  street: 'Kapelsesteenweg 531 A',
  postalCode: null as string | null,
  city: null as string | null,
  addressVerified: false,
  country: 'BE',
  area: 'Ekeren',
  phone: '03 326 06 30',
  phoneHref: 'tel:+3233260630',
  telephone: '+3233260630',
  email: 'info@mouline.be',
  url: 'https://www.mouline.be/',
  instagram: 'https://www.instagram.com/foodbarmouline/',
  googleMapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Foodbar%20Mouline%20Kapelsesteenweg%20531%20A%20Belgium',
  openingHours: [
    {
      label: 'Maandag',
      shortLabel: 'Ma',
      days: ['Monday'],
      opens: '09:00',
      closes: '16:00',
      display: '9u tot 16u',
    },
    {
      label: 'Dinsdag tot vrijdag',
      shortLabel: 'Di–vr',
      days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '16:00',
      display: '8u tot 16u',
    },
    {
      label: 'Zaterdag',
      days: ['Saturday'],
      opens: null,
      closes: null,
      display: 'Gesloten',
    },
    {
      label: 'Zondag',
      days: ['Sunday'],
      opens: null,
      closes: null,
      display: 'Bel voor de openingsuren',
      unverified: true,
    },
  ],
  source: 'https://www.mouline.be/contact.html',
  checkedAt: '2026-09-07',
};
export function todayHours(date = new Date()) {
  const day = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Brussels',
    weekday: 'long',
  }).format(date);
  return business.openingHours.find((h) => h.days.includes(day));
}
export function localDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Brussels',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
export function restaurantSchema() {
  const imageBase = staticHosting
    ? 'https://ildongato.github.io/Foodbar-Mouline/'
    : business.url;
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: business.name,
    url: business.url,
    logo: `${imageBase}images/logo.svg`,
    image: `${imageBase}images/interieur.jpg`,
    telephone: business.telephone,
    email: business.email,
    ...(business.addressVerified && business.postalCode && business.city
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: business.street,
            postalCode: business.postalCode,
            addressLocality: business.city,
            addressCountry: business.country,
          },
        }
      : {}),
    openingHoursSpecification: business.openingHours
      .filter((h) => h.opens && h.closes)
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.days.map((d) => `https://schema.org/${d}`),
        opens: h.opens,
        closes: h.closes,
      })),
    servesCuisine: ['Ontbijt', 'Lunch'],
    menu: `${business.url}#menu`,
    sameAs: [business.instagram],
  };
}

export const compactOpeningHours = business.openingHours
  .filter((row) => row.opens && row.closes)
  .map(
    (row) =>
      `${row.shortLabel} ${Number(row.opens!.slice(0, 2))}–${Number(row.closes!.slice(0, 2))}u`,
  )
  .join(' · ');
