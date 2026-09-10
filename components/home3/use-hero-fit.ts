import { useLayoutEffect, useRef } from 'react';

/** Size the photo from the space left after the actual title and info rows.
 * Only the photo's reserved frame changes; its image never controls layout. */
export function useHeroFit() {
  const heroRef = useRef<HTMLElement>(null);
  const informationRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    const information = informationRef.current;
    const title = hero?.querySelector<HTMLElement>('.hero-title');
    if (!hero || !information || !title) return;

    const measure = () => {
      hero.style.setProperty(
        '--hero-info-height',
        `${information.getBoundingClientRect().height}px`,
      );
      hero.style.setProperty(
        '--hero-title-height',
        `${title.getBoundingClientRect().height}px`,
      );
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(information);
    resize.observe(title);
    return () => {
      resize.disconnect();
      hero.style.removeProperty('--hero-info-height');
      hero.style.removeProperty('--hero-title-height');
    };
  }, []);

  return { heroRef, informationRef };
}
