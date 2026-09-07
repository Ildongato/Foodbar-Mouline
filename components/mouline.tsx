'use client';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  ArrowDown,
  ArrowUpRight,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
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
import ContactForm from './contact-form';
import Reviews from './reviews';
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
    caption: 'Een plek voor jouw dagelijkse pauze.',
    large: 1600,
    small: 800,
  },
  {
    name: 'ontbijt',
    alt: 'Ontbijtbord met kaas, ham en noten bij Mouline',
    caption: 'De ochtend mag even duren.',
    large: 1280,
    small: 640,
  },
  {
    name: 'broodjes',
    alt: 'Vers belegde broodjes klaargezet op de toonbank bij Mouline',
    caption: 'Klaargemaakt op de Kapelsesteenweg.',
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
    name: 'terras',
    alt: 'Tafels met stoelen op het terras van Mouline',
    caption: 'Even buiten zitten.',
  },
];
function Photo({
  name,
  alt,
  className = '',
  sizes = '(max-width: 700px) 100vw, 60vw',
}: {
  name: string;
  alt: string;
  className?: string;
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
      className={className}
    />
  );
}
function Hours({ compact = false }: { compact?: boolean }) {
  return (
    <dl className={`hours ${compact ? 'compact-hours' : ''}`}>
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
export default function Mouline() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mode, setMode] = useState<MenuMode>('onsite');
  const [intent, setIntent] = useState<Intent>('Reservatie');
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [motionReduced, setMotionReduced] = useState(true);
  const [allowAutoplay, setAllowAutoplay] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [heroVisible, setHeroVisible] = useState(true);
  const [loader, setLoader] = useState(false);
  const [today, setToday] = useState<ReturnType<typeof todayHours>>();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [privacy, setPrivacy] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const touchX = useRef<number | null>(null);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motion = () => setMotionReduced(media.matches);
    motion();
    media.addEventListener('change', motion);
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    setAllowAutoplay(
      !connection?.saveData &&
        !['slow-2g', '2g'].includes(connection?.effectiveType ?? ''),
    );
    let loaderTimer: ReturnType<typeof setTimeout> | undefined;
    try {
      if (!media.matches && !sessionStorage.getItem('mouline-intro')) {
        setLoader(true);
        sessionStorage.setItem('mouline-intro', 'played');
        loaderTimer = setTimeout(() => setLoader(false), 700);
      }
    } catch {
      /* Content works when storage is disabled. */
    }
    const update = () => setScrolled(window.scrollY > 40);
    update();
    window.addEventListener('scroll', update, { passive: true });
    const visibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', visibility);
    const updateToday = () => setToday(todayHours());
    updateToday();
    const clock = setInterval(updateToday, 60000);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-15% 0px -60% 0px', threshold: 0 },
    );
    document
      .querySelectorAll('main>section[id]')
      .forEach((section) => observer.observe(section));
    const heroObserver = new IntersectionObserver((entries) =>
      setHeroVisible(entries[0].isIntersecting),
    );
    if (heroRef.current) heroObserver.observe(heroRef.current);
    const revealObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            revealObserver.unobserve(e.target);
          }
        }),
      { threshold: 0.06 },
    );
    document
      .querySelectorAll('.reveal')
      .forEach((el) => revealObserver.observe(el));
    return () => {
      window.removeEventListener('scroll', update);
      media.removeEventListener('change', motion);
      document.removeEventListener('visibilitychange', visibility);
      clearTimeout(loaderTimer);
      clearInterval(clock);
      observer.disconnect();
      heroObserver.disconnect();
      revealObserver.disconnect();
    };
  }, []);
  const auto =
    allowAutoplay && !motionReduced && !paused && pageVisible && heroVisible;
  useEffect(() => {
    if (!auto) return;
    const timer = setInterval(
      () => setSlide((s) => (s + 1) % heroSlides.length),
      6500,
    );
    return () => clearInterval(timer);
  }, [auto]);
  function changeSlide(direction: number) {
    setPaused(true);
    setSlide((s) => (s + direction + heroSlides.length) % heroSlides.length);
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
      {loader && (
        <div className="page-loader" aria-hidden="true">
          <img
            src={assetPath('/images/logo.svg')}
            width="142"
            height="100"
            alt=""
          />
          <span />
        </div>
      )}
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
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
          href="#menu"
          onClick={() => chooseMenu('takeaway')}
          className="button header-cta"
        >
          Takeaway bestellen <ArrowUpRight size={17} />
        </a>
        <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
          <DialogTrigger
            className="mobile-trigger"
            aria-label="Navigatiemenu openen"
          >
            <MenuIcon size={23} />
          </DialogTrigger>
          <DialogContent className="mobile-menu" showCloseButton={false}>
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
                Takeaway bestellen <ArrowUpRight size={17} />
              </a>
              <a href={business.phoneHref}>{business.phone}</a>
              <span>{business.street}</span>
            </div>
          </DialogContent>
        </Dialog>
      </header>
      <main id="main">
        <section
          ref={heroRef}
          className="hero"
          id="home"
          aria-label="Welkom bij Mouline"
        >
          <div
            className="hero-photo"
            onTouchStart={(e) => {
              touchX.current = e.touches[0].clientX;
              setPaused(true);
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
                className={`hero-slide ${i === slide ? 'is-active' : ''}`}
                fetchPriority={i === 0 ? 'high' : 'low'}
                loading={i === 0 ? 'eager' : 'lazy'}
                width="2048"
                height="1365"
                alt={s.alt}
                aria-hidden={i !== slide}
              />
            ))}
          </div>
          <div className="hero-copy">
            <p className="eyebrow">
              Foodbar Mouline <span>Ekeren</span>
            </p>
            <h1>
              Dagvers in Ekeren.
              <span className="hero-subtitle">
                Van ontbijt tot <em>lunch.</em>
              </span>
            </h1>
            <p className="hero-description">
              Ontbijt, lunch, broodjes en catering, klaargemaakt op de
              Kapelsesteenweg in Ekeren.
            </p>
            <div className="hero-actions">
              <a
                href="#menu"
                onClick={() => chooseMenu('onsite')}
                className="button button-ink"
              >
                Menu ter plaatse <ArrowDown size={17} />
              </a>
              <a
                href="#menu"
                onClick={() => chooseMenu('takeaway')}
                className="text-link"
              >
                Takeaway bestellen <ArrowUpRight size={17} />
              </a>
            </div>
            <div className="hero-today">
              <span className="status-dot" />
              <span>
                {today ? (
                  today.opens ? (
                    <>
                      Vandaag open <strong>{today.display}</strong>
                    </>
                  ) : today.unverified ? (
                    <a href={business.phoneHref}>
                      Vandaag: bel voor de openingsuren
                    </a>
                  ) : (
                    'Vandaag gesloten'
                  )
                ) : (
                  <>{compactOpeningHours}</>
                )}
              </span>
            </div>
          </div>
          <div className="hero-caption">
            <span>{heroSlides[slide].caption}</span>
            <div className="slide-controls" aria-label="Fotocarrousel">
              <button onClick={() => changeSlide(-1)} aria-label="Vorige foto">
                <ChevronLeft size={18} />
              </button>
              <div className="slide-progress">
                {heroSlides.map((s, i) => (
                  <span className={i === slide ? 'current' : ''} key={s.name} />
                ))}
              </div>
              <button onClick={() => changeSlide(1)} aria-label="Volgende foto">
                <ChevronRight size={18} />
              </button>
              {allowAutoplay && !motionReduced && (
                <button
                  onClick={() => setPaused((p) => !p)}
                  aria-label={
                    paused ? 'Fotocarrousel afspelen' : 'Fotocarrousel pauzeren'
                  }
                >
                  {paused ? <Play size={14} /> : <Pause size={14} />}
                </button>
              )}
            </div>
          </div>
        </section>
        <section className="daily strip">
          <div>
            <h2>Dagvers bij Mouline</h2>
            <p>Elke ochtend opnieuw belegd, gebakken en klaargezet.</p>
          </div>
          <div className="daily-details">
            <div>
              <span className="small-label">Openingstijden</span>
              <p>{compactOpeningHours}</p>
            </div>
            <div>
              <span className="small-label">Bestellen</span>
              <p>Voor 11u, afhalen op afspraak</p>
            </div>
            <a href="#contact" className="text-link">
              {business.street} <ArrowUpRight size={16} />
            </a>
          </div>
        </section>
        <MenuSection
          mode={mode}
          onModeChange={setMode}
          onReserve={() => openContact('Reservatie')}
        />
        <section id="over-ons" className="about-section">
          <div className="about-photo reveal">
            <Photo
              name="sfeer"
              alt="Zitbank met kleurrijke kussens in het interieur van Mouline"
              sizes="100vw"
            />
          </div>
          <div className="about-copy reveal">
            <p className="eyebrow">Aangenaam, Mouline</p>
            <h2>
              Hier begint
              <br />
              elke ochtend vers.
            </h2>
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
        <section id="fotos" className="gallery-section container">
          <div className="section-heading reveal">
            <div>
              <p className="eyebrow">Aan tafel en achter de toog</p>
              <h2>Een blik bij Mouline.</h2>
            </div>
            <a
              className="text-link"
              href={business.instagram}
              target="_blank"
              rel="noreferrer"
            >
              Volg ons op Instagram <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="editorial-gallery">
            {photos.map((p, i) => (
              <figure className={`gallery-item photo-${i} reveal`} key={p.name}>
                <button
                  onClick={() => setLightbox(i)}
                  aria-label={`Vergroot foto: ${p.alt}`}
                >
                  <Photo
                    name={p.name}
                    alt={p.alt}
                    sizes={
                      i === 0
                        ? '(max-width: 700px) 100vw, 60vw'
                        : '(max-width: 700px) 70vw, 40vw'
                    }
                  />
                  <span className="photo-expand">
                    <Plus size={19} />
                  </span>
                </button>
                <figcaption>{p.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>
        <section id="catering" className="catering-section">
          <div className="catering-heading container reveal">
            <p className="eyebrow">Mouline op jouw locatie</p>
            <h2>
              Van ontbijtmeeting
              <br />
              tot volle tafel.
            </h2>
            <div className="catering-bottom">
              <p>
                Ontbijt, lunch, receptie of een tafel vol hapjes. Mouline
                verzorgt catering op maat van het moment.
              </p>
              <a
                href="#contact"
                onClick={() => openContact('Catering')}
                className="button button-ink"
              >
                Vraag catering aan <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
          <div className="catering-photo reveal">
            <Photo
              name="broodjes"
              alt="Een toonbank vol belegde broodjes voor catering bij Foodbar Mouline"
              sizes="100vw"
            />
            <div className="catering-caption">
              <span>Ontbijt</span>
              <span>Lunch</span>
              <span>Vergaderingen</span>
              <span>Recepties</span>
              <span>Hapjes</span>
            </div>
          </div>
        </section>
        <section id="contact" className="contact-section container">
          <div className="contact-info reveal">
            <p className="eyebrow">We horen graag van je</p>
            <h2>Tot straks?</h2>
            <p className="contact-intro">
              Een tafel, een vraag of plannen voor een volle tafel? Laat iets
              van je horen.
            </p>
            <div className="contact-links">
              <a href={business.phoneHref}>
                {business.phone}
                <ArrowUpRight size={22} />
              </a>
              <a href={`mailto:${business.email}`}>
                {business.email}
                <ArrowUpRight size={22} />
              </a>
            </div>
            <div className="contact-hours">
              <h3>Wanneer schuif je aan?</h3>
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
          <div className="location-panel">
            <div>
              <p className="eyebrow">Hier vind je ons</p>
              <h2>{business.street}</h2>
              {business.addressVerified &&
                business.postalCode &&
                business.city && (
                  <p>
                    {business.postalCode} {business.city}
                  </p>
                )}
              <a
                href={business.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                Open in Google Maps <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="parking">
              <span className="parking-letter" aria-hidden="true">
                P
              </span>
              <div>
                <h3>Parking voor de deur.</h3>
                <p>Je bent er zo.</p>
              </div>
            </div>
          </div>
          {process.env.NODE_ENV !== 'production' &&
            !business.addressVerified && (
              <details className="developer-note">
                <summary>
                  Ontwikkelnotitie: adrescontrole voor publicatie
                </summary>
                <p>
                  TODO CLIENT VERIFICATION: bevestig postcode en gemeente (2180
                  Ekeren of 2930 Brasschaat). Tot dan staan deze velden niet in
                  adresblokken of Restaurant JSON-LD. De route zoekt op de
                  bedrijfsnaam en straat.
                </p>
              </details>
            )}
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-main container">
          <a href="#home" aria-label="Mouline, naar boven">
            <img
              src={assetPath('/images/logo-light.svg')}
              width="128"
              height="90"
              alt="Foodbar Mouline"
            />
          </a>
          <div className="footer-address">
            <p>{business.street}</p>
            {business.addressVerified && (
              <p>
                {business.postalCode} {business.city}
              </p>
            )}
            <a href={business.phoneHref}>{business.phone}</a>
            <a href={`mailto:${business.email}`}>{business.email}</a>
          </div>
          <Hours compact />
          <a className="back-top" href="#home" aria-label="Terug naar boven">
            <ArrowUp size={22} />
          </a>
        </div>
        <div className="footer-bottom container">
          <span>© {new Date().getFullYear()} Foodbar Mouline</span>
          <span>Ontbijt. Lunch. Takeaway. Catering.</span>
          <div>
            <a href={business.instagram} target="_blank" rel="noreferrer">
              Instagram <ArrowUpRight size={12} />
            </a>
            <button onClick={() => setPrivacy(true)}>Privacy</button>
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
          <p>
            Je formuliergegevens worden niet in je browser opgeslagen. Alleen
            voor de korte openingsanimatie wordt tijdelijk onthouden dat je de
            website in deze sessie al hebt bezocht.
          </p>
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
