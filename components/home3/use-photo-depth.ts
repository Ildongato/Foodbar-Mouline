import { useEffect, type RefObject } from 'react';

/** Move only the oversized photo layer; the frame and controls never move. */
export function usePhotoDepth(
  ref: RefObject<HTMLElement | null>,
  range: 'page' | 'viewport' = 'page',
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const nativeScroll =
      CSS.supports('animation-timeline: scroll(root block)') &&
      CSS.supports('animation-range: 0px 100px');
    let frame = 0;
    let top = 0;
    let start = 0;
    let height = 0;
    const paint = () => {
      frame = 0;
      const progress = Math.max(
        0,
        Math.min(
          1,
          (window.scrollY - start) / Math.max(1, top + height - start),
        ),
      );
      // Layer extends 8% beyond BOTH edges; travel is capped at 6% of the frame.
      element.style.setProperty(
        '--hero-parallax',
        `${reduced.matches ? 0 : progress * height * 0.06}px`,
      );
    };
    const measure = () => {
      cancelAnimationFrame(frame);
      const bounds = element.getBoundingClientRect();
      top = bounds.top + window.scrollY;
      height = bounds.height;
      start = range === 'viewport' ? Math.max(0, top - window.innerHeight) : 0;
      element.style.setProperty('--hero-depth-start', `${start}px`);
      element.style.setProperty('--hero-depth-end', `${height * 0.06}px`);
      element.style.setProperty(
        '--hero-depth-distance',
        `${Math.max(1, top + height)}px`,
      );
      element.dataset.depthMotion = nativeScroll ? 'native' : 'fallback';
      if (!nativeScroll || reduced.matches) paint();
      else frame = 0;
    };
    const schedule = () => {
      if (!frame && !nativeScroll && !reduced.matches)
        frame = requestAnimationFrame(paint);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    // Menu categories above this photo can change its document position.
    if (range === 'viewport') observer.observe(document.body);
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure);
    reduced.addEventListener('change', measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', measure);
      reduced.removeEventListener('change', measure);
      element.style.removeProperty('--hero-parallax');
      element.style.removeProperty('--hero-depth-start');
      element.style.removeProperty('--hero-depth-end');
      element.style.removeProperty('--hero-depth-distance');
      delete element.dataset.depthMotion;
    };
  }, [ref, range]);
}
