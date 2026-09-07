'use client';
import { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, Star } from 'lucide-react';
import { assetPath, staticHosting } from '@/lib/hosting';
import selectedReviews from '@/lib/data/google-reviews.json';

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
  rating: number;
  count: number;
  url: string;
  reviews: Review[];
  source: 'manual' | 'api';
  checkedAt?: string;
  attributions?: { provider: string; providerUri?: string }[];
}
function Stars({ rating }: { rating: number }) {
  return (
    <span
      className="review-stars"
      role="img"
      aria-label={`${rating.toLocaleString('nl-BE')} van 5 sterren`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span className="review-star" aria-hidden="true" key={i}>
          <Star size={16} />
          <Star
            size={16}
            fill="currentColor"
            style={{
              clipPath: `inset(0 ${100 - Math.max(0, Math.min(1, rating - i + 1)) * 100}% 0 0)`,
            }}
          />
        </span>
      ))}
    </span>
  );
}
export default function Reviews() {
  const [data, setData] = useState<ReviewData>({
    ...selectedReviews,
    source: 'manual',
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
            .then(
              (r) =>
                r.json() as Promise<Partial<ReviewData> & { status: string }>,
            )
            .then((value) => {
              const reviews = (value.reviews ?? [])
                .filter(
                  (review: Review) =>
                    review.text?.text || review.originalText?.text,
                )
                .slice(0, 3);
              if (
                value.status === 'ready' &&
                typeof value.rating === 'number' &&
                typeof value.count === 'number' &&
                typeof value.url === 'string' &&
                reviews.length === 3
              ) {
                setData({
                  rating: value.rating,
                  count: value.count,
                  url: value.url,
                  attributions: value.attributions,
                  reviews,
                  source: 'api',
                });
              }
            })
            .catch(() => {
              /* Keep the verified, dated selection if the API is unavailable. */
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

  return (
    <section
      id="reviews"
      className="reviews-section reviews-editorial container"
      ref={ref}
    >
      <div className="reviews-heading">
        <div className="reviews-intro">
          <p className="eyebrow">Aan tafel verteld</p>
          <h2>Wat onze gasten zeggen.</h2>
        </div>
        <a
          className="rating-summary"
          href={data.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`${data.rating.toLocaleString('nl-BE')} van 5, ${data.count} beoordelingen op Google Maps`}
        >
          <strong>
            {data.rating.toLocaleString('nl-BE', { maximumFractionDigits: 1 })}
          </strong>
          <div>
            <Stars rating={data.rating} />
            <p>{data.count.toLocaleString('nl-BE')} beoordelingen</p>
            <img
              className="google-attribution"
              src={assetPath('/images/google-maps.svg')}
              width="108"
              height="18"
              alt="Google Maps"
            />
          </div>
        </a>
      </div>
      <div className="review-excerpts">
        {data.reviews.map((review) => (
          <article key={review.name}>
            <Stars rating={review.rating} />
            <blockquote cite={review.googleMapsUri}>
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
                  href={review.authorAttribution.uri || review.googleMapsUri}
                  target="_blank"
                  rel="noreferrer"
                >
                  {review.authorAttribution.displayName}
                </a>
                {data.source === 'api' && (
                  <p>{review.relativePublishTimeDescription}</p>
                )}
              </div>
            </div>
            <a
              className="review-source"
              href={review.googleMapsUri}
              target="_blank"
              rel="noreferrer"
            >
              Lees de review op Google <ArrowUpRight size={13} />
            </a>
          </article>
        ))}
      </div>
      <div className="reviews-foot">
        <p className="review-order">
          {data.source === 'manual' ? (
            <>
              Citaten uit Google Maps. Geraadpleegd op{' '}
              <time dateTime={data.checkedAt}>
                {new Date(`${data.checkedAt}T12:00:00Z`).toLocaleDateString(
                  'nl-BE',
                  {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'Europe/Brussels',
                  },
                )}
              </time>
              .
            </>
          ) : (
            'Op relevantie geselecteerd door Google Maps.'
          )}
        </p>
        <a
          className="text-link"
          href={data.url}
          target="_blank"
          rel="noreferrer"
        >
          Alle reviews op Google <ArrowUpRight size={16} />
        </a>
      </div>
      {data.attributions?.map((a) => (
        <a className="review-source" key={a.provider} href={a.providerUri}>
          {a.provider}
        </a>
      ))}
    </section>
  );
}
