import { Star } from 'lucide-react';
import type { CSSProperties } from 'react';
import { assetPath } from '@/lib/hosting';
import selection from '@/lib/data/google-reviews.json';

export default function GuestReviews() {
  return (
    <section
      id="reviews"
      className="reviews-section"
      aria-labelledby="reviews-title"
    >
      <div
        className="container review-content"
        style={
          {
            '--review-mill-image': `url("${assetPath('/home3/images/mouline-house-outline.svg')}")`,
          } as CSSProperties
        }
      >
        <h2 id="reviews-title">Wat onze gasten zeggen.</h2>
        <div className="review-excerpts">
          {selection.reviews.map((review) => (
            <figure key={review.name}>
              <div className="review-stars">
                <span className="sr-only">{review.rating} van 5 sterren</span>
                {Array.from({ length: review.rating }, (_, index) => (
                  <Star
                    key={index}
                    size={12}
                    fill="currentColor"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <blockquote cite={review.googleMapsUri}>
                &ldquo;{review.text.text}&rdquo;
              </blockquote>
              <figcaption>
                <a
                  href={review.googleMapsUri}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${review.authorAttribution.displayName}, Google-review (nieuw tabblad)`}
                >
                  {review.authorAttribution.displayName}
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
