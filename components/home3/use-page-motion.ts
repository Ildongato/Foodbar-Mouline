import { useEffect } from 'react';

// Animate editorial groups once. Menu rows and controls stay together.
const targets = [
  '.menu-section',
  '.about-photo',
  '.about-copy',
  '.review-content',
  '.gallery-section > .section-heading',
  '.gallery-item',
  '.catering-copy',
  '.catering-inner > img',
  '.contact-info',
  '.form-area',
  '.location-section',
  '.footer-inner',
].join(',');

export function usePageMotion() {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (
      preference.matches ||
      !('IntersectionObserver' in window) ||
      !('animate' in Element.prototype)
    )
      return;

    const elements = [...document.querySelectorAll<HTMLElement>(targets)];
    const opening = [
      ...document.querySelectorAll<HTMLElement>(
        '.header-inner, .hero h1, .hero-support, .hero-photo img, .practical',
      ),
    ];
    const finishOpening = (event: AnimationEvent) => {
      if (opening.includes(event.target as HTMLElement)) {
        (event.target as HTMLElement).dataset.opening = 'complete';
      }
    };
    const animations = new Map<HTMLElement, Animation>();
    const show = (element: HTMLElement) => {
      observer.unobserve(element);
      element.dataset.motion = 'shown';
      animations.get(element)?.cancel();
      animations.delete(element);
    };
    const reveal = (element: HTMLElement) => {
      if (element.dataset.motion !== 'pending') return;
      observer.unobserve(element);
      element.dataset.motion = 'revealing';
      // Opacity only for the menu: its sticky controls keep their normal context.
      const distance = element.matches('.menu-section') ? 0 : 14;
      const frames = distance
        ? [
            { opacity: 0, transform: `translateY(${distance}px)` },
            { opacity: 1, transform: 'none' },
          ]
        : [{ opacity: 0 }, { opacity: 1 }];
      try {
        const animation = element.animate(frames, {
          duration: 850,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'backwards',
        });
        animations.set(element, animation);
        animation.finished
          .then(() => {
            if (animations.get(element) === animation) {
              animations.delete(element);
              element.dataset.motion = 'shown';
            }
          })
          .catch(() => {});
      } catch {
        show(element);
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) reveal(entry.target as HTMLElement);
        }
      },
      { threshold: 0, rootMargin: '0px 0px -28px 0px' },
    );

    // Keep existing viewport content visible during hydration and history return.
    for (const element of elements) {
      if (element.getBoundingClientRect().top < window.innerHeight) {
        element.dataset.motion = 'shown';
      } else {
        element.dataset.motion = 'pending';
        observer.observe(element);
      }
    }
    const showWithin = (target: Element) => {
      for (const element of elements) {
        if (target.contains(element) || element.contains(target)) show(element);
      }
    };
    const followHash = () => {
      let id;
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      const target = document.getElementById(id);
      if (target) showWithin(target);
    };
    const focus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      showWithin(event.target);
      // Finish permanently on focus; a CSS :focus-within cancellation would
      // restart the entrance when focus subsequently leaves the navigation.
      for (const element of opening) {
        if (element.contains(event.target)) element.dataset.opening = 'complete';
      }
    };
    const anchor = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const target = document.getElementById(link.hash.slice(1));
      if (target) showWithin(target);
    };
    const reduce = () => {
      if (preference.matches) {
        observer.disconnect();
        elements.forEach(show);
        opening.forEach((element) => (element.dataset.opening = 'complete'));
      }
    };
    followHash();
    document.addEventListener('animationend', finishOpening);
    document.addEventListener('focusin', focus);
    document.addEventListener('click', anchor, true);
    window.addEventListener('hashchange', followHash);
    preference.addEventListener('change', reduce);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      elements.forEach((element) => {
        delete element.dataset.motion;
      });
      opening.forEach((element) => {
        delete element.dataset.opening;
      });
      document.removeEventListener('animationend', finishOpening);
      document.removeEventListener('focusin', focus);
      document.removeEventListener('click', anchor, true);
      window.removeEventListener('hashchange', followHash);
      preference.removeEventListener('change', reduce);
    };
  }, []);
}
