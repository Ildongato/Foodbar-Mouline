'use client';
import { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, Star } from 'lucide-react';
import { business } from '@/lib/business';
import { assetPath, staticHosting } from '@/lib/hosting';
interface Review {
  name: string;
  rating: number;
  text?: { text: string };
  originalText?: { text: string };
  authorAttribution: { displayName: string; uri?: string; photoUri?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
  googleMapsUri: string;
}
interface ReviewData {
  status: string;
  rating?: number | null;
  count?: number | null;
  url?: string;
  reviews?: Review[];
  attributions?: { provider: string; providerUri?: string }[];
}
function Stars({ rating }: { rating: number }) {
  return (
    <span className="review-stars" aria-label={`${rating} van 5 sterren`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={16}
          fill={i <= Math.round(rating) ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
export default function Reviews() {
  const [data, setData] = useState<ReviewData>({
    status: staticHosting ? 'unconfigured' : 'loading',
  });
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (staticHosting) return;
    const controller = new AbortController();
    let fetched = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !fetched) {
          fetched = true;
          observer.disconnect();
          fetch('/api/reviews', { signal: controller.signal })
            .then((r) => r.json())
            .then((value) => setData(value as ReviewData))
            .catch(() => {
              if (!controller.signal.aborted)
                setData({ status: 'unavailable' });
            });
        }
      },
      { rootMargin: '200px' },
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      controller.abort();
      observer.disconnect();
    };
  }, []);
  const hasData = data.status === 'ready' && typeof data.rating === 'number';
  return (
    <section
      id="reviews"
      className={`reviews-section container ${hasData ? '' : 'reviews-invitation'}`}
      ref={ref}
    >
      <div className="reviews-intro reveal">
        <p className="eyebrow">Aan tafel verteld</p>
        <h2>Wat onze gasten zeggen.</h2>
        {hasData && (
          <a
            className="text-link"
            href={data.url || business.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            Bekijk alle reviews op Google <ArrowUpRight size={16} />
          </a>
        )}
      </div>
      {hasData ? (
        <div className="google-content">
          <div className="rating-summary">
            <strong>
              {data.rating?.toLocaleString('nl-BE', {
                maximumFractionDigits: 1,
              })}
            </strong>
            <div>
              <Stars rating={data.rating!} />
              <p>{data.count?.toLocaleString('nl-BE')} beoordelingen</p>
              <img
                className="google-attribution"
                src={assetPath('/images/google-maps.svg')}
                width="108"
                height="18"
                alt="Google Maps"
              />
            </div>
          </div>
          <p className="review-order">
            Op relevantie geselecteerd door Google Maps.
          </p>
          <div className="review-excerpts">
            {data.reviews?.map((review) => (
              <article key={review.name}>
                <Stars rating={review.rating} />
                <blockquote>
                  {review.text?.text || review.originalText?.text}
                </blockquote>
                <div className="review-author">
                  {review.authorAttribution.photoUri && (
                    <img
                      src={review.authorAttribution.photoUri}
                      width="36"
                      height="36"
                      alt={review.authorAttribution.displayName}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div>
                    <a
                      href={
                        review.authorAttribution.uri || review.googleMapsUri
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      {review.authorAttribution.displayName}
                    </a>
                    <p>{review.relativePublishTimeDescription}</p>
                  </div>
                </div>
                <a
                  className="review-source"
                  href={review.googleMapsUri}
                  target="_blank"
                  rel="noreferrer"
                >
                  Bekijk op Google Maps <ArrowUpRight size={13} />
                </a>
              </article>
            ))}
          </div>
          {data.attributions?.map((a) => (
            <a className="review-source" key={a.provider} href={a.providerUri}>
              {a.provider}
            </a>
          ))}
        </div>
      ) : (
        <div className="reviews-unconfigured">
          <p>
            Lees de ervaringen van onze gasten op Google Maps. Of vertel er over
            jouw bezoek.
          </p>
          <a
            className="text-link"
            href={business.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            Bekijk de reviews op Google <ArrowUpRight size={16} />
          </a>
          {process.env.NODE_ENV !== 'production' && (
            <details className="developer-note">
              <summary>Ontwikkelnotitie: Google-reviews</summary>
              <p>
                TODO: configureer GOOGLE_PLACES_API_KEY en GOOGLE_PLACE_ID. Hier
                verschijnen de actuele score, het aantal beoordelingen en drie
                echte reviews met bronvermelding. Er worden geen
                voorbeeldreviews getoond.
              </p>
            </details>
          )}
        </div>
      )}
    </section>
  );
}
