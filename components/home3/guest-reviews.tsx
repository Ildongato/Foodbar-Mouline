import { Star } from 'lucide-react';
import selection from '@/lib/data/google-reviews.json';
import MillArtwork from './mill-artwork';

export default function GuestReviews() {
  return (
    <section
      id="reviews"
      className="reviews-section"
      aria-labelledby="reviews-title"
    >
      <MillArtwork />
      <div className="container review-content">
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
                {review.text.text}
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
