import { useLayoutEffect, useRef } from 'react';

/** Reserve the information strip's actual height, including wrapped text and
 * font-size changes. CSS handles the crop and the short-screen fallback. */
export function useHeroFit() {
  const heroRef = useRef<HTMLElement>(null);
  const informationRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    const information = informationRef.current;
    if (!hero || !information) return;

    const measure = () => {
      hero.style.setProperty(
        '--hero-info-height',
        `${information.getBoundingClientRect().height}px`,
      );
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(information);
    return () => {
      resize.disconnect();
      hero.style.removeProperty('--hero-info-height');
    };
  }, []);

  return { heroRef, informationRef };
}
