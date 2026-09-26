import { useLayoutEffect, useRef, type RefObject } from 'react';

/** Stable endpoints: scrolling only transforms the original SVG, never its layout.
 * Native scroll timelines follow iOS momentum without waiting for JS scroll events.
 * Older browsers use the exact same geometry in a single animation-frame update. */
export function useHeroScroll(heroRef: RefObject<HTMLElement | null>) {
  const headerRef = useRef<HTMLElement>(null);
  const navSlotRef = useRef<HTMLSpanElement>(null);
  const millRef = useRef<HTMLAnchorElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const navSlot = navSlotRef.current;
    const mill = millRef.current;
    const wordmark = wordmarkRef.current;
    const slot = slotRef.current;
    const header = headerRef.current;
    const hero = heroRef.current;
    if (!navSlot || !mill || !wordmark || !slot || !header || !hero) return;

    const words = wordmark.querySelectorAll<HTMLElement>('.hero-word');
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const nativeScroll =
      CSS.supports('animation-timeline: scroll(root block)') &&
      CSS.supports('animation-range: 0px 100px');
    let frame = 0;
    let distance = 1;
    let startY = 0;
    let endY = 0;
    let endScale = 1;
    let landingEnd = 0;
    let disposed = false;

    const paint = () => {
      frame = 0;
      // Clamp Safari's elastic overscroll so neither endpoint can drift.
      const scroll = Math.max(0, window.scrollY);
      const progress = preference.matches
        ? Number(scroll >= distance)
        : Math.min(1, scroll / distance);
      if (!nativeScroll || preference.matches) {
        const y = startY + (endY - startY) * progress;
        const scale = 1 + (endScale - 1) * progress;
        mill.style.transform = `translate3d(-50%, ${y}px, 0) scale(${scale})`;
        words.forEach((word) => {
          word.style.opacity = `${1 - progress}`;
        });
      }
      const compact = scroll >= landingEnd;
      if (header.dataset.compact !== String(compact))
        header.dataset.compact = String(compact);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const measure = () => {
      cancelAnimationFrame(frame);
      // These slots never animate. Do not observe the changing header / SVG.
      const origin = slot.getBoundingClientRect();
      const nav = navSlot.getBoundingClientRect();
      const fullHeader = header.getBoundingClientRect().height;
      const compactHeader = Math.max(60, fullHeader - 12);
      startY = origin.top + window.scrollY;
      endY = (compactHeader - nav.height) / 2;
      endScale = nav.width / origin.width;
      const originCenter = startY + origin.height / 2;
      // Dock before the wordmark passes the navigation, also on small phones.
      distance = Math.max(1, originCenter - compactHeader / 2);
      const photo = hero.querySelector<HTMLElement>('.hero-frame');
      landingEnd = Math.max(
        0,
        (photo ?? hero).getBoundingClientRect().top +
          window.scrollY -
          fullHeader,
      );
      mill.style.setProperty('--mill-size', `${origin.width}px`);
      mill.style.setProperty('--mill-start-y', `${startY}px`);
      mill.style.setProperty('--mill-end-y', `${endY}px`);
      mill.style.setProperty('--mill-end-scale', `${endScale}`);
      for (const element of [mill, wordmark]) {
        element.style.setProperty('--mill-distance', `${distance}px`);
        element.dataset.scrollMotion = nativeScroll ? 'native' : 'fallback';
      }
      mill.style.removeProperty('transform');
      words.forEach((word) => word.style.removeProperty('opacity'));
      paint();
    };
    const restore = () => {
      measure();
      // History restoration may apply its scroll position after pageshow.
      schedule();
    };
    const visibility = () => {
      if (document.visibilityState === 'visible') restore();
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(navSlot);
    resize.observe(slot);
    resize.observe(hero);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('scrollend', schedule);
    window.addEventListener('resize', measure);
    window.addEventListener('pageshow', restore);
    document.addEventListener('visibilitychange', visibility);
    preference.addEventListener('change', measure);
    void document.fonts.ready.then(() => {
      if (!disposed) restore();
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('scrollend', schedule);
      window.removeEventListener('resize', measure);
      window.removeEventListener('pageshow', restore);
      document.removeEventListener('visibilitychange', visibility);
      preference.removeEventListener('change', measure);
      for (const name of [
        '--mill-size',
        '--mill-start-y',
        '--mill-end-y',
        '--mill-end-scale',
        '--mill-distance',
        'transform',
      ])
        mill.style.removeProperty(name);
      wordmark.style.removeProperty('--mill-distance');
      delete mill.dataset.scrollMotion;
      delete wordmark.dataset.scrollMotion;
      delete header.dataset.compact;
      words.forEach((word) => word.style.removeProperty('opacity'));
    };
  }, [heroRef]);

  return { headerRef, navSlotRef, millRef, wordmarkRef, slotRef };
}
