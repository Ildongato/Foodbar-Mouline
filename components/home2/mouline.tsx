'use client';
/* oxlint-disable nextjs/no-img-element -- Local WebP srcsets and SVGs must also work in the static Pages entry without an image server. */
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { flushSync } from 'react-dom';
import {
  ArrowUpRight,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Menu as MenuIcon,
  X,
  Plus,
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
import Reviews from '../reviews';
import {
  business,
  todayHours,
  restaurantSchema,
  compactOpeningHours,
} from '@/lib/business';
import { type MenuMode } from '@/lib/menu';
import { type Intent } from '@/lib/contact';
import { assetPath } from '@/lib/hosting';

const links = [
  ['Menu', 'menu'],
  ['Over ons', 'over-ons'],
  ['Reviews', 'reviews'],
  ['Foto’s', 'fotos'],
  ['Catering', 'catering'],
  ['Contact', 'contact'],
];
const heroSlides = [
  {
    name: 'interieur',
    alt: 'Tafels en zitbanken in het interieur van Foodbar Mouline',
    large: 1600,
    small: 800,
  },
  {
    name: 'ontbijt',
    alt: 'Een ontbijt met kazen, ham en noten bij Mouline',
    large: 1280,
    small: 640,
  },
  {
    name: 'broodjes',
    alt: 'Vers belegde broodjes op de toonbank bij Mouline',
    large: 1280,
    small: 640,
  },
  {
    name: 'terras',
    alt: 'Tafels en stoelen op het terras van Mouline',
    large: 1280,
    small: 640,
  },
];
const photos = [
  {
    name: 'ontbijt',
    alt: 'Ontbijtbord met kazen, ham en noten bij Foodbar Mouline',
    caption: 'Een goede start.',
  },
  {
    name: 'koffie',
    alt: 'Koffiekopjes op de plank bij Foodbar Mouline',
    caption: 'Nog een koffie?',
  },
  {
    name: 'gebak',
    alt: 'Koffiekoeken en rozijnenkoeken klaargezet bij Mouline',
    caption: 'Iets voor erbij.',
  },
  {
    name: 'salade',
    alt: 'Salade met zalm en verse groenten bij Mouline',
    caption: 'Kleur op je bord.',
  },
  {
    name: 'wrap',
    alt: 'Wrap met kip en groenten op een bord bij Mouline',
    caption: 'Ook om mee te nemen.',
  },
  {
    name: 'terras',
    alt: 'Tafels met stoelen op het terras van Mouline',
    caption: 'Even buiten zitten.',
  },
];
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
export default function MoulineHome2() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mode, setMode] = useState<MenuMode>('onsite');
  const [intent, setIntent] = useState<Intent>('Reservatie');
  const [slide, setSlide] = useState(0);
  const [today, setToday] = useState<ReturnType<typeof todayHours>>();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [privacy, setPrivacy] = useState(false);
  const touchX = useRef<number | null>(null);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 16);
    update();
    window.addEventListener('scroll', update, { passive: true });
    const updateToday = () => setToday(todayHours());
    updateToday();
    const clock = setInterval(updateToday, 60000);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-15% 0px -60% 0px' },
    );
    document
      .querySelectorAll('main section[id]')
      .forEach((section) => observer.observe(section));
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reveal = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            if (!media.matches) e.target.classList.add('is-revealed');
            reveal.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    document
      .querySelectorAll('.chapter-reveal')
      .forEach((element) => reveal.observe(element));
    return () => {
      window.removeEventListener('scroll', update);
      clearInterval(clock);
      observer.disconnect();
      reveal.disconnect();
    };
  }, []);
  function changeSlide(direction: number) {
    setSlide((s) => (s + direction + heroSlides.length) % heroSlides.length);
  }
  function slideKeys(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      changeSlide(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }
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
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-inner container">
          <a className="brand" href="#home" aria-label="Mouline, naar boven">
            <img
              src={assetPath('/images/logo.svg')}
              width="85"
              height="60"
              alt="Foodbar Mouline"
            />
          </a>
          <nav aria-label="Hoofdnavigatie">
            {links.map(([label, id]) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active === id ? 'location' : undefined}
              >
                {label}
              </a>
            ))}
          </nav>
          <a
            className="button header-cta"
            href="#menu"
            onClick={() => chooseMenu('takeaway')}
          >
            Takeawaykaart <ArrowUpRight size={16} />
          </a>
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
                <img
                  src={assetPath('/images/logo.svg')}
                  width="100"
                  height="70"
                  alt="Foodbar Mouline"
                />
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
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                    <ArrowUpRight size={25} />
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
        </div>
      </header>
      <main id="main">
        <section className="hero" id="home" aria-label="Welkom bij Mouline">
          <div
            className="hero-photo"
            onTouchStart={(e) => {
              touchX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchX.current !== null) {
                const dx = e.changedTouches[0].clientX - touchX.current;
                if (Math.abs(dx) > 45) changeSlide(dx > 0 ? -1 : 1);
                touchX.current = null;
              }
            }}
          >
            {heroSlides.map((s, i) => (
              <img
                key={s.name}
                src={assetPath(`/images/${s.name}-${s.large}.webp`)}
                srcSet={`${assetPath(`/images/${s.name}-${s.small}.webp`)} ${s.small}w, ${assetPath(`/images/${s.name}-${s.large}.webp`)} ${s.large}w`}
                sizes="100vw"
                width="1600"
                height="1067"
                className={`hero-slide ${i === slide ? 'is-active' : ''}`}
                alt={s.alt}
                aria-hidden={i !== slide}
                fetchPriority={i === 0 ? 'high' : 'low'}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
          <div className="hero-inner container">
            <div className="hero-copy">
              <p className="hero-kicker">Foodbar Mouline · Ekeren</p>
              <h1>
                Dagvers in Ekeren.<span>Van ontbijt tot lunch.</span>
              </h1>
              <p className="hero-description">
                Ontbijt, lunch en broodjes uit onze keuken op de
                Kapelsesteenweg.
              </p>
              <div className="hero-actions">
                <a
                  className="button button-primary"
                  href="#menu"
                  onClick={() => chooseMenu('onsite')}
                >
                  Menu ter plaatse <ArrowUpRight size={17} />
                </a>
                <a
                  className="text-link"
                  href="#menu"
                  onClick={() => chooseMenu('takeaway')}
                >
                  Takeawaykaart <ArrowUpRight size={17} />
                </a>
              </div>
            </div>
            <fieldset className="slide-controls">
              <legend className="sr-only">Fotocarrousel</legend>
              <button
                aria-label="Vorige foto"
                onClick={() => changeSlide(-1)}
                onKeyDown={slideKeys}
              >
                <ChevronLeft size={20} />
              </button>
              <span
                className="slide-count"
                aria-live="polite"
                aria-atomic="true"
                aria-label={`Foto ${slide + 1} van ${heroSlides.length}`}
              >
                {String(slide + 1).padStart(2, '0')} /{' '}
                {String(heroSlides.length).padStart(2, '0')}
              </span>
              <button
                aria-label="Volgende foto"
                onClick={() => changeSlide(1)}
                onKeyDown={slideKeys}
              >
                <ChevronRight size={20} />
              </button>
            </fieldset>
          </div>
        </section>
        <aside
          className="practical container"
          aria-label="Praktische informatie"
        >
          <p>
            Ontbijt <strong>tot 11u</strong>
            <span>Lunch vanaf 11u</span>
          </p>
          <a href="#menu" onClick={() => chooseMenu('takeaway')}>
            Takeaway <strong>bestel voor 11u</strong>
          </a>
          <p>
            {today ? (
              today.opens ? (
                <>
                  Vandaag <strong>{today.display}</strong>
                </>
              ) : today.unverified ? (
                <a href={business.phoneHref}>
                  Vandaag: bel voor de openingsuren
                </a>
              ) : (
                <strong>Vandaag gesloten</strong>
              )
            ) : (
              compactOpeningHours
            )}
          </p>
        </aside>
        <div className="menu-chapter">
          <MenuSection
            mode={mode}
            onModeChange={setMode}
            onReserve={() => openContact('Reservatie')}
          />
        </div>
        <section id="over-ons" className="about-section container">
          <div className="about-photo chapter-reveal">
            <Photo
              name="sfeer"
              alt="Zitbank met kleurrijke kussens in het interieur van Mouline"
            />
          </div>
          <div className="about-copy">
            <h2>Aangenaam, Mouline.</h2>
            <p>
              Mouline is een foodbar op de Kapelsesteenweg in Ekeren, voor
              ontbijt, lunch en dagverse gerechten. Vanuit de eigen keuken wordt
              elke ochtend voorbereid wat later op je bord of in je takeawayzak
              belandt.
            </p>
            <a href="#contact" className="text-link">
              Kom gerust langs <ArrowUpRight size={16} />
            </a>
          </div>
        </section>
        <Reviews />
        <div className="gallery-chapter">
          <section id="fotos" className="gallery-section container">
            <div className="section-heading">
              <h2>Aan tafel en achter de toog.</h2>
              <a
                href={business.instagram}
                className="text-link"
                target="_blank"
                rel="noreferrer"
              >
                Volg ons op Instagram <ArrowUpRight size={16} />
              </a>
            </div>
            <div className="photo-grid chapter-reveal">
              {photos.map((p, i) => (
                <figure className={`gallery-item photo-${i}`} key={p.name}>
                  <button
                    onClick={() => setLightbox(i)}
                    aria-label={`Vergroot foto: ${p.alt}`}
                  >
                    <Photo
                      name={p.name}
                      alt={p.alt}
                      sizes={
                        i === 0
                          ? '(max-width: 650px) 100vw, 65vw'
                          : '(max-width: 650px) 50vw, 33vw'
                      }
                    />
                    <span className="photo-expand">
                      <Plus size={18} />
                    </span>
                  </button>
                  <figcaption>{p.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        </div>
        <section id="catering" className="catering-section">
          <div className="catering-inner container chapter-reveal">
            <div className="catering-copy">
              <p className="eyebrow">Mouline op jouw locatie</p>
              <h2>
                Van ontbijtmeeting
                <br />
                tot volle tafel.
              </h2>
              <p>
                Voor ontbijt, lunch, een vergadering, receptie of een tafel vol
                hapjes. Mouline verzorgt catering op maat van het moment.
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
            <h2>Tot straks?</h2>
            <p className="contact-intro">
              Een tafel, een vraag of plannen voor een volle tafel? Laat iets
              van je horen.
            </p>
            <div className="contact-links">
              <a href={business.phoneHref}>
                {business.phone} <ArrowUpRight size={20} />
              </a>
              <a href={`mailto:${business.email}`}>
                {business.email} <ArrowUpRight size={20} />
              </a>
            </div>
            <div className="contact-hours">
              <h3>Openingsuren</h3>
              <Hours />
            </div>
            <p className="contact-urgent">
              Voor een aanvraag voor vandaag bel je ons het best even.
            </p>
          </div>
          <ContactForm intent={intent} onIntentChange={setIntent} />
        </section>
        <section
          className="location-section container"
          aria-label="Locatie en route"
        >
          <div>
            <h2>{business.street}</h2>
            {business.addressVerified &&
              business.postalCode &&
              business.city && (
                <p>
                  {business.postalCode} {business.city}
                </p>
              )}
            <p>Parking voor de deur.</p>
          </div>
          <a
            className="text-link"
            href={business.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open in Google Maps <ArrowUpRight size={18} />
          </a>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-inner container">
          <a href="#home" aria-label="Mouline, naar boven">
            <img
              src={assetPath('/images/logo-light.svg')}
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
      <Dialog
        open={lightbox !== null}
        onOpenChange={(open) => {
          if (!open) setLightbox(null);
        }}
      >
        <DialogContent
          className="lightbox"
          showCloseButton={false}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              setLightbox((i) => ((i ?? 0) + 1) % photos.length);
            }
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              setLightbox(
                (i) => ((i ?? 0) - 1 + photos.length) % photos.length,
              );
            }
          }}
        >
          <DialogTitle className="sr-only">
            {lightbox !== null ? photos[lightbox].alt : 'Foto van Mouline'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Blader met de pijltjestoetsen. Sluit met Escape.
          </DialogDescription>
          <DialogClose
            className="lightbox-close icon-button"
            aria-label="Foto sluiten"
          >
            <X size={27} />
          </DialogClose>
          {lightbox !== null && (
            <>
              <Photo
                name={photos[lightbox].name}
                alt={photos[lightbox].alt}
                sizes="90vw"
              />
              <div className="lightbox-bar">
                <button
                  className="icon-button"
                  aria-label="Vorige galerijfoto"
                  onClick={() =>
                    setLightbox(
                      (i) => ((i ?? 0) - 1 + photos.length) % photos.length,
                    )
                  }
                >
                  <ChevronLeft size={24} />
                </button>
                <p>{photos[lightbox].caption}</p>
                <button
                  className="icon-button"
                  aria-label="Volgende galerijfoto"
                  onClick={() =>
                    setLightbox((i) => ((i ?? 0) + 1) % photos.length)
                  }
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
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
