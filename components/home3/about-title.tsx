'use client';
import { useEffect, useId, useRef } from 'react';

export default function AboutTitle() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const maskRef = useRef<SVGPathElement>(null);
  const maskId = `about-writing-${useId()}`;

  useEffect(() => {
    const title = titleRef.current;
    const path = maskRef.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (
      !title ||
      !path ||
      preference.matches ||
      !('IntersectionObserver' in window) ||
      !('animate' in path) ||
      !document.fonts
    )
      return;

    let played = false;
    let visible = false;
    let fontReady = false;
    let disposed = false;
    let animation: Animation | undefined;

    const show = () => {
      played = true;
      observer.disconnect();
      animation?.cancel();
      path.style.strokeDashoffset = '0';
    };
    const reveal = () => {
      if (disposed || played || !visible || !fontReady) return;
      played = true;
      observer.disconnect();
      // The final state is the underlying style, including after cancellation.
      path.style.strokeDashoffset = '0';
      try {
        animation = path.animate(
          [{ strokeDashoffset: '1' }, { strokeDashoffset: '0' }],
          {
            duration: 1250,
            easing: 'cubic-bezier(0.3, 0.05, 0.25, 1)',
            fill: 'backwards',
          },
        );
      } catch {
        show();
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        reveal();
      },
      { threshold: 0.35 },
    );
    const reduce = () => {
      if (preference.matches) show();
    };

    path.style.strokeDashoffset = '1';
    observer.observe(title);
    preference.addEventListener('change', reduce);
    // Wait for the small local subset so the font never changes mid-reveal.
    document.fonts
      .load('100px "Mouline Handwritten"', 'Over Mouline')
      .then(() => {
        fontReady = true;
        reveal();
      })
      .catch(() => {
        if (!disposed) show();
      });

    return () => {
      disposed = true;
      observer.disconnect();
      preference.removeEventListener('change', reduce);
      animation?.cancel();
      path.style.strokeDashoffset = '0';
    };
  }, []);

  return (
    <h2 id="about-title" className="about-script-title" ref={titleRef}>
      <span className="sr-only">Over Mouline</span>
      <svg
        viewBox="0 0 550 108"
        width="550"
        height="108"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="550"
            height="108"
          >
            {/* One curved, round-edged sweep reveals the connected lettering. */}
            <path
              ref={maskRef}
              className="about-script-mask"
              d="M -80 58 C 50 42 105 70 185 55 S 345 48 420 58 S 535 50 630 54"
              fill="none"
              stroke="white"
              strokeWidth="144"
              strokeLinecap="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="0"
            />
          </mask>
        </defs>
        <text
          className="about-script-lettering"
          x="0"
          y="88"
          fill="currentColor"
          mask={`url(#${maskId})`}
        >
          Over Mouline
        </text>
      </svg>
    </h2>
  );
}
