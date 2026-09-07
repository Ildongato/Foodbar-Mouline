import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mouline.be'),
  title: 'Foodbar Mouline | Ontbijt, lunch en catering in Ekeren',
  description:
    'Ontbijt, lunch, broodjes en catering op de Kapelsesteenweg in Ekeren. Ontdek het menu ter plaatse en de takeawaykaart. Bestel voor 11u. Parking voor de deur.',
  alternates: { canonical: 'https://www.mouline.be/' },
  robots: { index: false, follow: true },
  openGraph: {
    type: 'website',
    locale: 'nl_BE',
    url: 'https://www.mouline.be/',
    siteName: 'Foodbar Mouline',
    title: 'Dagvers in Ekeren. Van ontbijt tot lunch.',
    description: 'Ontbijt, lunch, broodjes en catering bij Foodbar Mouline.',
    images: [
      {
        url: '/images/interieur.jpg',
        width: 2048,
        height: 1365,
        alt: 'Het interieur van Foodbar Mouline',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Foodbar Mouline in Ekeren',
    description: 'Dagvers in Ekeren. Van ontbijt tot lunch.',
    images: ['/images/interieur.jpg'],
  },
  icons: { icon: '/favicon.png', apple: '/apple-touch-icon.png' },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl-BE">
      <head>
        <link
          rel="preload"
          as="image"
          href="/images/ontbijt-1280.webp"
          imageSrcSet="/images/ontbijt-640.webp 640w, /images/ontbijt-1280.webp 1280w"
          imageSizes="(max-width: 800px) 100vw, 75vw"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
