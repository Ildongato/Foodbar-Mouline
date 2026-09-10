'use client';
/* oxlint-disable nextjs/no-img-element -- Local WebP srcsets and SVGs must also work in the static Pages entry without an image server. */
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  ArrowUpRight,
  ArrowUp,
  Menu as MenuIcon,
  X,
  Sprout,
  Soup,
  Croissant,
  Heart,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import MenuSection from './menu-section';
import ContactForm from '../contact-form';
import GuestReviews from './guest-reviews';
import HeaderMill from './header-mill';
import GallerySection from './gallery-section';
import AboutTitle from './about-title';
import TodayHours from './today-hours';
import CulinaryIcon from './culinary-icon';
import { usePageMotion } from './use-page-motion';
import { useHeroScroll } from './use-hero-scroll';
import { useHeroFit } from './use-hero-fit';
import { business, restaurantSchema } from '@/lib/business';
import { type MenuMode } from '@/lib/menu';
import { type Intent } from '@/lib/contact';
import { assetPath } from '@/lib/hosting';

const links = [
  ['Menu', 'menu'],
  ['Over', 'over-ons'],
  ['Reviews', 'reviews'],
  ['Foto’s', 'fotos'],
  ['Catering', 'catering'],
  ['Contact', 'contact'],
];
const primaryLinks = links.filter(([, id]) =>
  ['menu', 'over-ons', 'fotos', 'catering'].includes(id),
);
function Photo({
  name,
  alt,
  sizes = '(max-width: 700px) 100vw, 55vw',
}: {
  name: string;
  alt: string;
  sizes?: string;
}) {
  return (
    <img
      src={assetPath(`/images/${name}-1280.webp`)}
      srcSet={`${assetPath(`/images/${name}-640.webp`)} 640w, ${assetPath(`/images/${name}-1280.webp`)} 1280w`}
      sizes={sizes}
      width="1280"
      height="853"
      loading="lazy"
      decoding="async"
      alt={alt}
    />
  );
}
function Hours() {
  return (
    <dl className="hours">
      {business.openingHours.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>
            {row.unverified ? (
              <a href={business.phoneHref}>{row.display}</a>
            ) : (
              row.display
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
export default function MoulineHome3() {
  usePageMotion();
  const { heroRef, informationRef } = useHeroFit();
  const { headerRef, navSlotRef, millRef, wordmarkRef, slotRef } =
    useHeroScroll(heroRef);
  const [active, setActive] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mode, setMode] = useState<MenuMode>('onsite');
  const [intent, setIntent] = useState<Intent>('Reservatie');
  const [privacy, setPrivacy] = useState(false);
  useEffect(() => {
    // Navigation observation is optional; content never depends on an observer.
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            (entries) => {
              for (const e of entries)
                if (e.isIntersecting) setActive(e.target.id);
            },
            { rootMargin: '-15% 0px -60% 0px' },
          );
    document
      .querySelectorAll('main section[id]')
      .forEach((section) => observer?.observe(section));
    return () => {
      observer?.disconnect();
    };
  }, []);
  function chooseMenu(next: MenuMode) {
    setMode(next);
    setMobileOpen(false);
  }
  function openContact(next: Intent) {
    setIntent(next);
    setMobileOpen(false);
  }
  useEffect(() => {
    type Context = {
      registerTool: (
        tool: {
          name: string;
          title: string;
          description: string;
          inputSchema: object;
          annotations: object;
          execute: (input: unknown) => unknown;
        },
        options: { signal: AbortSignal },
      ) => Promise<void> | void;
    };
    const context = (document as Document & { modelContext?: Context })
      .modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tools = [
      {
        name: 'show_mouline_menu',
        title: 'Toon de Mouline-menukaart',
        description:
          'Open het menu ter plaatse of takeaway. Plaatst geen bestelling.',
        inputSchema: {
          type: 'object',
          properties: {
            mode: { type: 'string', enum: ['onsite', 'takeaway'] },
          },
          required: ['mode'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input: unknown) {
          const value = (input as { mode?: unknown })?.mode;
          if (value !== 'onsite' && value !== 'takeaway')
            throw new Error('mode must be onsite or takeaway');
          flushSync(() => {
            setMode(value);
            setMobileOpen(false);
          });
          document.getElementById('menu')?.scrollIntoView();
          return { mode: value, section: 'menu', orderPlaced: false };
        },
      },
      {
        name: 'start_mouline_contact',
        title: 'Start een contactaanvraag',
        description:
          'Open het formulier voor reservatie, catering of een vraag. Verzendt niets en bevestigt geen tafel.',
        inputSchema: {
          type: 'object',
          properties: {
            intent: {
              type: 'string',
              enum: ['Reservatie', 'Catering', 'Andere vraag'],
            },
          },
          required: ['intent'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input: unknown) {
          const value = (input as { intent?: unknown })?.intent;
          if (
            !['Reservatie', 'Catering', 'Andere vraag'].includes(String(value))
          )
            throw new Error('Invalid intent');
          flushSync(() => {
            setIntent(value as Intent);
            setMobileOpen(false);
          });
          document.getElementById('contact')?.scrollIntoView();
          return { intent: value, section: 'contact', submitted: false };
        },
      },
    ];
    for (const tool of tools)
      try {
        Promise.resolve(
          context.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {});
      } catch {
        /* Normal UI remains available. */
      }
    return () => lifecycle.abort();
  }, []);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(restaurantSchema()).replace(/</g, '\\u003c'),
        }}
      />
      <a href="#main" className="skip-link">
        Ga naar de inhoud
      </a>
      <div className="header-space" aria-hidden="true" />
      <header className="site-header" ref={headerRef}>
        <div className="header-inner container">
          <nav aria-label="Hoofdnavigatie">
            {primaryLinks.map(([label, id]) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={id === 'menu' ? () => chooseMenu('onsite') : undefined}
                aria-current={active === id ? 'location' : undefined}
              >
                {label}
              </a>
            ))}
          </nav>
          <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
            <DialogTrigger
              className="mobile-trigger"
              aria-label="Navigatiemenu openen"
            >
              <MenuIcon size={23} />
            </DialogTrigger>
            <DialogContent
              className="mobile-menu translate-x-0 translate-y-0"
              showCloseButton={false}
            >
              <div className="mobile-menu-top">
                <a
                  href="#home"
                  aria-label="Mouline, naar boven"
                  onClick={() => setMobileOpen(false)}
                >
                  Mouline
                </a>
                <DialogClose
                  className="icon-button"
                  aria-label="Navigatiemenu sluiten"
                >
                  <X size={26} />
                </DialogClose>
              </div>
              <DialogTitle className="sr-only">Navigatie</DialogTitle>
              <DialogDescription className="sr-only">
                Navigeer naar een onderdeel van de Mouline-website.
              </DialogDescription>
              <nav aria-label="Mobiele navigatie">
                {links.map(([label, id]) => (
                  <a
                    href={`#${id}`}
                    key={id}
                    onClick={() => {
                      if (id === 'menu') chooseMenu('onsite');
                      else setMobileOpen(false);
                    }}
                  >
                    {label}
                    <ArrowUpRight size={20} />
                  </a>
                ))}
              </nav>
              <div className="mobile-menu-bottom">
                <a
                  className="button button-ink"
                  href="#menu"
                  onClick={() => chooseMenu('takeaway')}
                >
                  Takeawaykaart <ArrowUpRight size={17} />
                </a>
                <a href={business.phoneHref}>{business.phone}</a>
                <span>{business.street}</span>
              </div>
            </DialogContent>
          </Dialog>
          <span className="brand-slot" ref={navSlotRef} aria-hidden="true" />
          <a
            className="brand"
            ref={millRef}
            href="#home"
            aria-label="Mouline, naar boven"
          >
            <HeaderMill />
          </a>
          <a className="button header-cta" href="#contact">
            Contact <ArrowUpRight size={16} />
          </a>
        </div>
      </header>
      <main id="main">
        <section
          className="hero"
          id="home"
          ref={heroRef}
          aria-label="Welkom bij Mouline"
        >
          <div className="hero-title container">
            <h1
              className="hero-wordmark"
              ref={wordmarkRef}
              aria-label="Mouline Foodbar"
            >
              <span className="hero-word hero-word-left" aria-hidden="true">
                Mouline
              </span>
              <span
                className="hero-mill-slot"
                ref={slotRef}
                aria-hidden="true"
              />
              <span className="hero-word hero-word-right" aria-hidden="true">
                Foodbar
              </span>
            </h1>
            <div className="hero-caption">
              <p className="hero-founded">(Sinds 2018)</p>
              <p className="hero-location">Ekeren</p>
            </div>
          </div>
          <div className="hero-frame container">
            <img
              src={assetPath('/images/header-salade-b3624dd6-1280.webp')}
              srcSet={`${assetPath('/images/header-salade-b3624dd6-640.webp')} 640w, ${assetPath('/images/header-salade-b3624dd6-1280.webp')} 1280w`}
              sizes="(max-width: 650px) calc(100vw - 40px), (max-width: 800px) calc(100vw - 56px), (max-width: 1392px) 92vw, 1280px"
              width="1280"
              height="853"
              alt="Salade met zalm, avocado en verse groenten bij Foodbar Mouline"
              fetchPriority="high"
              loading="eager"
            />
          </div>
          <aside
            ref={informationRef}
            className="practical container"
            aria-label="Praktische informatie"
          >
            <p>
              Ontbijt <strong>tot 11u</strong>
              <span className="meal-separator" aria-hidden="true">
                •
              </span>
              Lunch vanaf 11u
            </p>
            <a
              className="takeaway-detail"
              href="#menu"
              onClick={() => chooseMenu('takeaway')}
            >
              <CulinaryIcon categoryId="link" />
              <span>
                Takeaway <strong>bestel voor 11u</strong>
              </span>
            </a>
            <TodayHours />
          </aside>
        </section>
        <div className="menu-chapter">
          <MenuSection
            mode={mode}
            onModeChange={setMode}
            onReserve={() => openContact('Reservatie')}
          />
        </div>
        <div className="about-chapter">
          <section
            id="over-ons"
            className="about-section container"
            aria-labelledby="about-title"
          >
            <div className="about-photo">
              <img
                src={assetPath('/images/aangenaam-mouline-128dae27-941.webp')}
                srcSet={`${assetPath('/images/aangenaam-mouline-128dae27-640.webp')} 640w, ${assetPath('/images/aangenaam-mouline-128dae27-941.webp')} 941w`}
                sizes="(max-width: 650px) calc(100vw - 40px), (max-width: 800px) calc(100vw - 56px), (max-width: 1392px) 40vw, 520px"
                width="941"
                height="1672"
                loading="lazy"
                decoding="async"
                alt="Een vrouw begroet je met een glimlach en een opgestoken hand bij Mouline"
              />
            </div>
            <div className="about-copy">
              <AboutTitle />
              <p className="about-intro">
                Ik ben Caroline. Na mijn opleiding als kok en kelner aan
                Spermali in Brugge droomde ik ervan om ooit mijn eigen zaak te
                openen. In 2019 werd die droom werkelijkheid met Mouline.
              </p>
              <p>
                Elke dag staan verse producten, huisgemaakte bereidingen en een
                warm onthaal centraal. Ook bij takeaway vinden we het belangrijk
                dat het vlot gaat, zonder in te boeten op kwaliteit of
                vriendelijkheid.
              </p>
            </div>
            <ul className="about-values">
              <li>
                <Sprout size={24} strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <h3>Vers</h3>
                  <p>
                    Dagelijkse levering van verse producten, zorgvuldig gekozen
                    voor onze gerechten.
                  </p>
                </div>
              </li>
              <li>
                <Soup size={24} strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <h3>Huisgemaakt</h3>
                  <p>
                    Onze smeersalades maken we zelf, met aandacht voor smaak en
                    kwaliteit.
                  </p>
                </div>
              </li>
              <li>
                <Croissant size={24} strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <h3>Van bij de bakker</h3>
                  <p>
                    Voor onze patisserie werken we samen met een bakker die elke
                    dag vers levert.
                  </p>
                </div>
              </li>
              <li>
                <Heart size={24} strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <h3>Gastvrij</h3>
                  <p>
                    Een vlotte uithaal, persoonlijke service en vooral een
                    vriendelijk onthaal voor elke klant.
                  </p>
                </div>
              </li>
            </ul>
          </section>
        </div>
        <GuestReviews />
        <GallerySection />
        <section id="catering" className="catering-section">
          <div className="catering-inner container">
            <div className="catering-copy">
              <p className="eyebrow">Mouline op jouw locatie</p>
              <h2>
                Van ontbijtmeeting
                <br />
                tot volle tafel.
              </h2>
              <p>
                Ontbijt, broodjes en hapjes voor vergaderingen en recepties.
              </p>
              <a
                href="#contact"
                onClick={() => openContact('Catering')}
                className="text-link"
              >
                Vraag catering aan <ArrowUpRight size={18} />
              </a>
            </div>
            <Photo
              name="broodjes"
              alt="Een toonbank vol belegde broodjes voor catering bij Foodbar Mouline"
              sizes="(max-width: 800px) 100vw, 50vw"
            />
          </div>
        </section>
        <section id="contact" className="contact-section container">
          <div className="contact-info">
            <div className="contact-primary">
              <h2>Tot straks?</h2>
              <p className="contact-intro">
                Voor een reservatie, catering of een vraag.
              </p>
              <div className="contact-links">
                <a href={business.phoneHref}>
                  {business.phone} <ArrowUpRight size={20} />
                </a>
                <a href={`mailto:${business.email}`}>
                  {business.email} <ArrowUpRight size={20} />
                </a>
              </div>
            </div>
            <div className="contact-secondary">
              <div className="contact-hours">
                <h3>Openingsuren</h3>
                <Hours />
              </div>
              <p className="contact-urgent">
                Voor een aanvraag voor vandaag bel je ons het best even.
              </p>
            </div>
          </div>
          <ContactForm intent={intent} onIntentChange={setIntent} />
        </section>
        <section
          className="location-section container"
          aria-label="Locatie en route"
        >
          <div className="location-copy">
            <h2>{business.street}</h2>
            {business.addressVerified &&
              business.postalCode &&
              business.city && (
                <p>
                  {business.postalCode} {business.city}
                </p>
              )}
            <p>Parking voor de deur.</p>
            <a
              className="text-link"
              href={business.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
            >
              Route in Google Maps <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="location-map">
            <a
              className="location-map-link"
              href={business.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Bekijk Foodbar Mouline, ${business.street}, in Google Maps (nieuw tabblad)`}
            >
              <picture>
                <source
                  media="(max-width: 650px)"
                  srcSet={assetPath('/home3/maps/mouline-mobile.svg')}
                />
                <img
                  src={assetPath('/home3/maps/mouline-desktop.svg')}
                  width="1000"
                  height="460"
                  loading="lazy"
                  decoding="async"
                  alt="Stratenkaart rond Mouline, aan de Kapelsesteenweg vlak bij de kruising met de Molenweg en Schriek"
                />
              </picture>
              <span className="map-marker" aria-hidden="true">
                <span>Mouline</span>
                <svg width="28" height="36" viewBox="0 0 28 36">
                  <path
                    d="M14 34C11 28 2 20 2 14a12 12 0 0 1 24 0c0 6-9 14-12 20Z"
                    fill="currentColor"
                    stroke="var(--paper)"
                    strokeWidth="2"
                  />
                  <circle cx="14" cy="14" r="4" fill="var(--paper)" />
                </svg>
              </span>
            </a>
            <a
              className="map-attribution"
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noreferrer"
            >
              © OpenStreetMap-bijdragers
            </a>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-inner container">
          <a href="#home" aria-label="Mouline, naar boven">
            <img
              src={assetPath('/home3/images/logo-cream.svg')}
              width="110"
              height="78"
              alt="Foodbar Mouline"
            />
          </a>
          <p>
            Ontbijt. Lunch. Takeaway. Catering.
            <span>© {new Date().getFullYear()} Foodbar Mouline</span>
          </p>
          <div className="footer-links">
            <a href={business.instagram} target="_blank" rel="noreferrer">
              Instagram <ArrowUpRight size={14} />
            </a>
            <button onClick={() => setPrivacy(true)}>Privacy</button>
            <a href="#home" aria-label="Terug naar boven">
              <ArrowUp size={18} />
            </a>
          </div>
        </div>
      </footer>
      <Dialog open={privacy} onOpenChange={setPrivacy}>
        <DialogContent className="privacy-dialog" showCloseButton={false}>
          <DialogClose
            className="privacy-close icon-button"
            aria-label="Privacy sluiten"
          >
            <X size={23} />
          </DialogClose>
          <DialogTitle>Privacy</DialogTitle>
          <DialogDescription>
            Over je gegevens op deze website.
          </DialogDescription>
          <p>
            De gegevens die je via het formulier invult, worden gebruikt om je
            aanvraag te beantwoorden. Bij een actieve verzendkoppeling wordt je
            aanvraag per e-mail bezorgd aan Mouline.
          </p>
          <p>Je formuliergegevens worden niet in je browser opgeslagen.</p>
          <p>
            Bij actieve Google-reviews geldt ook het{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noreferrer"
            >
              privacybeleid van Google
            </a>
            . Op Google Maps zijn de{' '}
            <a
              href="https://maps.google.com/help/terms_maps/"
              target="_blank"
              rel="noreferrer"
            >
              Google Maps-gebruiksvoorwaarden
            </a>{' '}
            van toepassing.
          </p>
          <p>
            Een vraag over je gegevens? Mail{' '}
            <a href={`mailto:${business.email}`}>{business.email}</a>.
          </p>
          <a
            className="text-link"
            href="https://www.mouline.be/privacy.html"
            target="_blank"
            rel="noreferrer"
          >
            Bekijk het privacybeleid van Mouline <ArrowUpRight size={16} />
          </a>
        </DialogContent>
      </Dialog>
    </>
  );
}
