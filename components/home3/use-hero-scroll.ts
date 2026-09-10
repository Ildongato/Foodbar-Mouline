import { useLayoutEffect, useRef, type RefObject } from 'react';

/** One SVG moves between measured positions, at its actual rendered size.
 * Avoid scaling a composited bitmap of the animated vector artwork. */
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
    let frame = 0;
    let distance = 1;
    let startY = 0;
    let startSize = 1;
    let finalSize = 1;
    let snapAt = 0;
    let landingEnd = 0;
    let disposed = false;

    const paint = () => {
      frame = 0;
      const scroll = Math.max(0, window.scrollY);
      const progress = preference.matches
        ? Number(scroll >= snapAt)
        : Math.min(1, scroll / distance);
      // No easing lag: the shared element follows scroll in both directions.
      mill.style.setProperty('--mill-y', `${startY * (1 - progress)}px`);
      mill.style.setProperty(
        '--mill-size',
        `${startSize + (finalSize - startSize) * progress}px`,
      );
      const compact = scroll >= landingEnd;
      if (header.dataset.compact !== String(compact))
        header.dataset.compact = String(compact);
      for (const word of words) {
        word.style.opacity = preference.matches ? '1' : `${1 - progress}`;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const measure = () => {
      cancelAnimationFrame(frame);
      const nav = navSlot.getBoundingClientRect();
      const destinationY = nav.top + nav.height / 2;
      const origin = slot.getBoundingClientRect();
      const originY = origin.top + window.scrollY + origin.height / 2;
      startY = originY - destinationY;
      distance = Math.max(120, startY + origin.height * 0.3);
      startSize = origin.width;
      finalSize = nav.width;
      snapAt = Math.max(1, originY - destinationY * 2);
      // Keep navigation legible as the photo replaces the gradient behind it.
      // Use the reserved height so compacting cannot change this threshold.
      const reservedHeader = hero.getBoundingClientRect().top + window.scrollY;
      const photo = hero.querySelector<HTMLElement>('.hero-frame');
      landingEnd =
        (photo ?? hero).getBoundingClientRect().top +
        window.scrollY -
        reservedHeader;
      paint();
    };

    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(navSlot);
    resize.observe(slot);
    resize.observe(header);
    resize.observe(hero);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('pageshow', measure);
    preference.addEventListener('change', measure);
    void document.fonts.ready.then(() => {
      if (!disposed) measure();
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', measure);
      window.removeEventListener('pageshow', measure);
      preference.removeEventListener('change', measure);
      mill.style.removeProperty('--mill-y');
      mill.style.removeProperty('--mill-size');
      delete header.dataset.compact;
      words.forEach((word) => {
        word.style.removeProperty('opacity');
      });
    };
  }, [heroRef]);

  return { headerRef, navSlotRef, millRef, wordmarkRef, slotRef };
}
