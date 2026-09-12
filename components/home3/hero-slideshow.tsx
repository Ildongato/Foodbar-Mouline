'use client';
/* oxlint-disable nextjs/no-img-element -- Responsive local images also serve the static Pages build. */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { Pause, Play } from 'lucide-react';
import { assetPath } from '@/lib/hosting';

const photos = [
  {
    title: 'Verse zalmsalade',
    alt: 'Salade met zalm, avocado en verse groenten bij Foodbar Mouline',
    src: '/images/header-salade-b3624dd6-1280.webp',
    srcSet:
      '/images/header-salade-b3624dd6-640.webp 640w, /images/header-salade-b3624dd6-1280.webp 1280w',
    width: 1280,
    height: 853,
    position: '50% 56%',
    mobilePosition: '50% 52%',
  },
  {
    title: 'Huisbereide broodjes',
    alt: 'Een belegd broodje wordt klaargemaakt aan de toonbank van Mouline',
    src: '/images/hero-broodje-bereiding-1440.webp',
    srcSet:
      '/images/hero-broodje-bereiding-640.webp 640w, /images/hero-broodje-bereiding-1440.webp 1440w',
    width: 1440,
    height: 1800,
    position: '50% 28%',
    mobilePosition: '50% 30%',
  },
  {
    title: 'Verse salade',
    alt: 'Kleurrijke salade met tomaat en verse groenten in een blauwgroene kom',
    src: '/images/hero-salade-groenten-1440.webp',
    srcSet:
      '/images/hero-salade-groenten-640.webp 640w, /images/hero-salade-groenten-1440.webp 1440w',
    width: 1440,
    height: 1641,
    position: '50% 58%',
    mobilePosition: '50% 55%',
  },
] as const;

type ImageStatus = 'loading' | 'ready' | 'error';
const interval = 5000;
const sizes =
  '(max-width: 650px) calc(100vw - 40px), (max-width: 800px) calc(100vw - 56px), (max-width: 1392px) 92vw, 1280px';

export default function HeroSlideshow() {
  const frame = useRef<HTMLElement>(null);
  const images = useRef<(HTMLImageElement | null)[]>([]);
  const progress = useRef<HTMLSpanElement>(null);
  const timer = useRef<Animation | null>(null);
  const [slide, setSlide] = useState({ current: 0, previous: -1 });
  const [status, setStatus] = useState<ImageStatus[]>(
    photos.map(() => 'loading'),
  );
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);
  const ready = status.every((item) => item !== 'loading');
  const available = status.filter((item) => item === 'ready').length;
  const playing =
    ready &&
    available > 1 &&
    !paused &&
    !hovered &&
    inView &&
    pageVisible &&
    !reducedMotion;

  const markLoaded = useCallback(
    async (index: number, image: HTMLImageElement) => {
      // Decode before revealing another image, including images cached before hydration.
      try {
        await image.decode();
      } catch {
        /* naturalWidth still detects a usable image. */
      }
      const result = image.naturalWidth ? 'ready' : 'error';
      setStatus((current) =>
        current[index] === result
          ? current
          : current.map((item, i) => (i === index ? result : item)),
      );
      const fallback = images.current.findIndex(
        (candidate) => candidate?.complete && candidate.naturalWidth > 0,
      );
      if (fallback !== -1) {
        setSlide((current) => {
          const active = images.current[current.current];
          return active?.complete && !active.naturalWidth
            ? { current: fallback, previous: -1 }
            : current;
        });
      }
    },
    [],
  );

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const motion = () => setReducedMotion(preference.matches);
    const visibility = () => setPageVisible(!document.hidden);
    motion();
    visibility();
    preference.addEventListener('change', motion);
    document.addEventListener('visibilitychange', visibility);
    images.current.forEach((image, index) => {
      if (image?.complete) void markLoaded(index, image);
    });
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 },
    );
    if (frame.current) observer.observe(frame.current);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', motion);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [markLoaded]);

  useEffect(() => {
    const usable = status.flatMap((item, index) =>
      item === 'ready' ? [index] : [],
    );
    if (
      !ready ||
      usable.length < 2 ||
      reducedMotion ||
      !progress.current?.animate
    )
      return;
    const next = usable[(usable.indexOf(slide.current) + 1) % usable.length];
    const animation = progress.current.animate(
      [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
      { duration: interval, easing: 'linear', fill: 'forwards' },
    );
    animation.pause();
    timer.current = animation;
    animation.onfinish = () => {
      if (timer.current === animation)
        setSlide({ current: next, previous: slide.current });
    };
    return () => {
      animation.cancel();
      if (timer.current === animation) timer.current = null;
    };
  }, [slide, status, ready, reducedMotion]);

  useEffect(() => {
    if (playing) timer.current?.play();
    else timer.current?.pause();
  }, [playing, slide, status, reducedMotion]);

  const select = (index: number) => {
    setPaused(true);
    if (status[index] === 'ready' && index !== slide.current) {
      setSlide({ current: index, previous: slide.current });
    }
  };

  return (
    <section
      className="hero-frame hero-slideshow container"
      ref={frame}
      aria-roledescription="carrousel"
      aria-label="Mouline in beeld"
      data-playing={playing}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
    >
      {photos.map((photo, index) => (
        <img
          key={photo.src}
          ref={(image) => {
            images.current[index] = image;
          }}
          className="hero-slide"
          data-active={slide.current === index}
          data-previous={slide.previous === index}
          data-entering={slide.current === index && slide.previous !== -1}
          style={
            {
              '--hero-image-position': photo.position,
              '--hero-image-position-mobile': photo.mobilePosition,
            } as CSSProperties
          }
          src={assetPath(photo.src)}
          srcSet={photo.srcSet
            .split(', ')
            .map((source) => assetPath(source))
            .join(', ')}
          sizes={sizes}
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          aria-hidden={slide.current !== index}
          fetchPriority={index === 0 ? 'high' : 'low'}
          loading="eager"
          decoding="async"
          onLoad={(event) => {
            void markLoaded(index, event.currentTarget);
          }}
          onError={(event) => {
            void markLoaded(index, event.currentTarget);
          }}
        />
      ))}
      <div className="hero-photo-controls">
        <fieldset className="hero-photo-pagination">
          <legend className="sr-only">Kies een foto</legend>
          {photos.map((photo, index) => (
            <button
              key={photo.src}
              type="button"
              className="hero-photo-dot"
              aria-label={`Toon foto ${index + 1} van ${photos.length}: ${photo.title}`}
              aria-pressed={slide.current === index}
              disabled={status[index] !== 'ready'}
              onFocus={() => setPaused(true)}
              onClick={() => select(index)}
            >
              <span className="hero-photo-mark" aria-hidden="true">
                {slide.current === index && (
                  <span className="hero-photo-progress" ref={progress} />
                )}
              </span>
            </button>
          ))}
        </fieldset>
        {!reducedMotion && available > 1 && (
          <button
            type="button"
            className="hero-photo-toggle"
            aria-label={paused ? 'Fotowissel afspelen' : 'Fotowissel pauzeren'}
            onClick={() => setPaused((current) => !current)}
          >
            {paused ? (
              <Play size={14} aria-hidden="true" />
            ) : (
              <Pause size={14} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      <span
        className="sr-only"
        aria-live={playing ? 'off' : 'polite'}
        aria-atomic="true"
      >
        Foto {slide.current + 1} van {photos.length}:{' '}
        {photos[slide.current].title}
      </span>
    </section>
  );
}
