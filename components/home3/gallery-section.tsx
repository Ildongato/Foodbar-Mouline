'use client';
/* oxlint-disable nextjs/no-img-element -- Local responsive WebP files also work in the static Pages build. */
import { useRef, useState, useSyncExternalStore } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import { assetPath } from '@/lib/hosting';
import {
  galleryPhotos,
  galleryPhotoPath,
  gallerySets,
  selectGallerySet,
  type GallerySet,
} from '@/lib/home3-gallery';
import GalleryLightbox from './gallery-lightbox';

let sessionSelection: GallerySet | undefined;

function subscribeToSession(onChange: () => void) {
  // The first subscription runs after hydration. Never choose during a render.
  if (!sessionSelection) {
    let storage: Storage | undefined;
    try {
      storage = window.sessionStorage;
    } catch {
      // A blocked storage API still gets one stable in-memory selection.
    }
    sessionSelection = selectGallerySet(storage);
    onChange();
  }
  // This selection is immutable for the lifetime of the page.
  return () => {};
}

const serverSelection = () => gallerySets[0];
const currentSelection = () => sessionSelection ?? serverSelection();

export default function GallerySection() {
  const selection = useSyncExternalStore(
    subscribeToSession,
    currentSelection,
    serverSelection,
  );
  const [lightbox, setLightbox] = useState<number | null>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <div className="gallery-chapter">
        <section id="fotos" className="gallery-section container">
          <div className="section-heading">
            <h2>Mouline in beeld</h2>
            <button
              type="button"
              className="text-link gallery-more"
              aria-haspopup="dialog"
              onClick={(event) => {
                openerRef.current = event.currentTarget;
                setLightbox(0);
              }}
            >
              Bekijk alle foto&apos;s <ArrowUpRight size={16} aria-hidden="true" />
            </button>
          </div>
          <div className="photo-grid">
            {selection.photos.map((id, slot) => {
              const index = galleryPhotos.findIndex((photo) => photo.id === id);
              const photo = galleryPhotos[index];
              return (
                // Keep the slot element stable, including its size and reveal.
                <figure className={`gallery-item photo-${slot}`} key={slot}>
                  <button
                    type="button"
                    aria-label={`Vergroot foto: ${photo.alt}`}
                    aria-haspopup="dialog"
                    onClick={(event) => {
                      openerRef.current = event.currentTarget;
                      setLightbox(index);
                    }}
                  >
                    <img
                      src={assetPath(galleryPhotoPath(photo, 1280))}
                      srcSet={`${assetPath(galleryPhotoPath(photo, 640))} 640w, ${assetPath(galleryPhotoPath(photo, 1280))} ${Math.min(1280, photo.width)}w`}
                      sizes={
                        slot === 0
                          ? '(max-width: 650px) calc(100vw - 40px), (min-width: 1440px) 840px, 65vw'
                          : slot === 5
                            ? '(max-width: 650px) calc(100vw - 40px), (min-width: 1440px) 410px, 33vw'
                            : '(max-width: 650px) calc(50vw - 28px), (min-width: 1440px) 410px, 33vw'
                      }
                      width={photo.width}
                      height={photo.height}
                      style={{ objectPosition: photo.position }}
                      loading="lazy"
                      decoding="async"
                      alt={photo.alt}
                    />
                    <span className="photo-expand" aria-hidden="true">
                      <Plus size={18} />
                    </span>
                  </button>
                </figure>
              );
            })}
          </div>
        </section>
      </div>
      <GalleryLightbox
        photos={galleryPhotos}
        index={lightbox}
        onIndexChange={setLightbox}
        returnFocusRef={openerRef}
      />
    </>
  );
}
