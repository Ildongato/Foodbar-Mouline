import { useLayoutEffect, useRef } from 'react';

/** One persistent SVG moves between two measured positions. The rotor's CSS
 * animation lives inside it, so scrolling never resets its rotation clock. */
export function useHeroScroll() {
  const navSlotRef = useRef<HTMLSpanElement>(null);
  const millRef = useRef<HTMLAnchorElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const navSlot = navSlotRef.current;
    const mill = millRef.current;
    const wordmark = wordmarkRef.current;
    const slot = slotRef.current;
    if (!navSlot || !mill || !wordmark || !slot) return;

    const words = wordmark.querySelectorAll<HTMLElement>('.hero-word');
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let distance = 1;
    let startY = 0;
    let finalScale = 1;
    let snapAt = 0;
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
        '--mill-scale',
        `${1 + (finalScale - 1) * progress}`,
      );
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
      finalScale = nav.width / origin.width;
      snapAt = Math.max(1, originY - destinationY * 2);
      paint();
    };

    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(navSlot);
    resize.observe(slot);
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
      mill.style.removeProperty('--mill-scale');
      words.forEach((word) => {
        word.style.removeProperty('opacity');
      });
    };
  }, []);

  return { navSlotRef, millRef, wordmarkRef, slotRef };
}
