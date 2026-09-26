import { useEffect } from 'react';

let cancelScroll = () => {};

/** One bounded movement per navigation; never combine a hash jump and a scroll. */
export function navigateToSection(id: string, updateHash = true) {
  const section = document.getElementById(id);
  if (!section) return;
  cancelScroll();
  if (updateHash && location.hash !== `#${id}`)
    history.pushState(history.state, '', `#${id}`);

  const start = window.scrollY;
  const padding =
    parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) ||
    0;
  const destination = () =>
    Math.max(
      0,
      Math.min(
        id === 'home' || id === 'main'
          ? 0
          : window.scrollY + section.getBoundingClientRect().top - padding,
        document.documentElement.scrollHeight - window.innerHeight,
      ),
    );
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const end = destination();
  const duration = Math.min(400, 220 + Math.abs(end - start) * 0.04);
  const started = performance.now();
  let frame = 0;
  const stop = () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchstart', stop);
    window.removeEventListener('keydown', onKey);
    reduced.removeEventListener('change', onPreference);
  };
  const focus = () => {
    const previous = section.getAttribute('tabindex');
    section.tabIndex = -1;
    section.focus({ preventScroll: true });
    section.addEventListener(
      'blur',
      () => {
        if (previous === null) section.removeAttribute('tabindex');
        else section.setAttribute('tabindex', previous);
      },
      { once: true },
    );
  };
  const onKey = (event: KeyboardEvent) => {
    if (
      [
        'ArrowUp',
        'ArrowDown',
        'PageUp',
        'PageDown',
        'Home',
        'End',
        ' ',
        'Tab',
        'Escape',
      ].includes(event.key)
    )
      stop();
  };
  const onPreference = () => {
    if (reduced.matches) {
      stop();
      window.scrollTo({ top: destination(), behavior: 'instant' });
      focus();
    }
  };
  const paint = (now: number) => {
    const progress = Math.min(1, (now - started) / duration);
    const eased = 1 - (1 - progress) ** 3;
    window.scrollTo({
      top: start + (end - start) * eased,
      behavior: 'instant',
    });
    if (progress < 1) frame = requestAnimationFrame(paint);
    else {
      stop();
      focus();
    }
  };
  cancelScroll = stop;
  if (reduced.matches) {
    window.scrollTo({ top: destination(), behavior: 'instant' });
    focus();
    return;
  }
  window.addEventListener('wheel', stop, { passive: true });
  window.addEventListener('touchstart', stop, { passive: true });
  window.addEventListener('keydown', onKey);
  reduced.addEventListener('change', onPreference);
  frame = requestAnimationFrame(paint);
}

export function useSectionNavigation() {
  useEffect(() => {
    const click = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>('a[href^="#"]')
          : null;
      if (
        !link ||
        link.hasAttribute('download') ||
        (link.target && link.target !== '_self')
      )
        return;
      let id: string;
      try {
        id = decodeURIComponent(link.hash.slice(1));
      } catch {
        return;
      }
      if (!id || !document.getElementById(id)) return;
      event.preventDefault();
      navigateToSection(id);
    };
    // Bubble phase: React opens the requested panel / closes the dialog first.
    document.addEventListener('click', click);
    return () => {
      document.removeEventListener('click', click);
      cancelScroll();
    };
  }, []);
}
