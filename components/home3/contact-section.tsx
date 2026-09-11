'use client';
/* oxlint-disable nextjs/no-img-element -- The map is a local SVG in the static Pages build. */
import { useRef } from 'react';
import { flushSync } from 'react-dom';
import { ArrowUpRight, Phone, MapPin, PenLine, X } from 'lucide-react';
import ContactForm from '../contact-form';
import { business } from '@/lib/business';
import { type Intent } from '@/lib/contact';
import { assetPath } from '@/lib/hosting';

export default function ContactSection({
  intent,
  onIntentChange,
  requestOpen,
  onRequestOpenChange,
}: {
  intent: Intent;
  onIntentChange: (intent: Intent) => void;
  requestOpen: boolean;
  onRequestOpenChange: (open: boolean) => void;
}) {
  const requestRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function showRequest() {
    flushSync(() => onRequestOpenChange(true));
    requestRef.current?.scrollIntoView({ block: 'start' });
    requestRef.current?.focus({ preventScroll: true });
  }

  function closeRequest() {
    flushSync(() => onRequestOpenChange(false));
    triggerRef.current?.focus();
  }

  return (
    <div className="contact-chapter">
      <section
        id="contact"
        className="contact-section container"
        aria-labelledby="contact-heading"
      >
        <div className="contact-info">
          <div className="contact-primary">
            <h2 id="contact-heading">Tot straks?</h2>
            <p className="contact-intro">
              Voor een reservatie, catering of een vraag.
            </p>
            <div className="contact-actions" aria-label="Snel contact">
              <a href={business.phoneHref}>
                <Phone size={17} strokeWidth={1.5} aria-hidden="true" /> Bel
              </a>
              <a href={business.googleMapsUrl} target="_blank" rel="noreferrer">
                <MapPin size={17} strokeWidth={1.5} aria-hidden="true" /> Route
              </a>
              <button
                ref={triggerRef}
                type="button"
                aria-expanded={requestOpen}
                aria-controls="contact-request"
                onClick={showRequest}
              >
                <PenLine size={17} strokeWidth={1.5} aria-hidden="true" />{' '}
                Aanvraag
              </button>
            </div>
            <div className="contact-links">
              <a href={business.phoneHref}>
                {business.phone} <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <a href={`mailto:${business.email}`}>
                {business.email} <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="contact-hours">
            <h3>Openingsuren</h3>
            <dl className="hours">
              {business.openingHours.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>
                    {row.unverified ? (
                      <a href={business.phoneHref}>{row.display}</a>
                    ) : (
                      row.display
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="contact-urgent">
              Voor een aanvraag voor vandaag bel je ons het best even.
            </p>
          </div>
          <div className="contact-location">
            <div className="location-copy">
              <h3 id="contact-address">{business.street}</h3>
              {business.addressVerified &&
                business.postalCode &&
                business.city && (
                  <p>
                    {business.postalCode} {business.city}
                  </p>
                )}
              <p>Parking voor de deur.</p>
              <a
                className="text-link"
                href={business.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
              >
                Route in Google Maps{' '}
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
            <div className="location-map">
              <a
                className="location-map-link"
                href={business.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Bekijk Foodbar Mouline, ${business.street}, in Google Maps (nieuw tabblad)`}
              >
                <picture>
                  <source
                    media="(max-width: 1000px)"
                    srcSet={assetPath('/home3/maps/mouline-mobile.svg')}
                  />
                  <img
                    src={assetPath('/home3/maps/mouline-desktop.svg')}
                    width="1000"
                    height="460"
                    loading="lazy"
                    decoding="async"
                    alt="Stratenkaart rond Mouline, aan de Kapelsesteenweg vlak bij de kruising met de Molenweg en Schriek"
                  />
                </picture>
                <span className="map-marker" aria-hidden="true">
                  <span>Mouline</span>
                  <svg width="28" height="36" viewBox="0 0 28 36">
                    <path
                      d="M14 34C11 28 2 20 2 14a12 12 0 0 1 24 0c0 6-9 14-12 20Z"
                      fill="currentColor"
                      stroke="var(--paper)"
                      strokeWidth="2"
                    />
                    <circle cx="14" cy="14" r="4" fill="var(--paper)" />
                  </svg>
                </span>
              </a>
              <a
                className="map-attribution"
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noreferrer"
              >
                © OpenStreetMap-bijdragers
              </a>
            </div>
          </div>
        </div>
        {/* One mounted form keeps entered values when collapsing or resizing. */}
        <section
          id="contact-request"
          className="contact-request"
          ref={requestRef}
          data-open={requestOpen}
          tabIndex={-1}
          aria-labelledby="contact-request-heading"
          onFocusCapture={() => {
            // Keep an in-progress desktop request visible after narrowing the screen.
            if (!requestOpen) onRequestOpenChange(true);
          }}
        >
          <div className="contact-request-heading">
            <h3 id="contact-request-heading">Een aanvraag doen</h3>
            <button
              type="button"
              className="contact-request-close"
              onClick={closeRequest}
              aria-label="Aanvraagformulier sluiten"
            >
              Sluiten <X size={16} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
          <ContactForm
            intent={intent}
            onIntentChange={onIntentChange}
            variant="editorial"
            delivery="direct"
          />
        </section>
      </section>
    </div>
  );
}
