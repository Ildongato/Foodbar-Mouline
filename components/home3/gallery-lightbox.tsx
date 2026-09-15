'use client';
/* oxlint-disable nextjs/no-img-element -- Local full-resolution WebP assets support the static Pages build. */
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { assetPath } from '@/lib/hosting';
import { galleryPhotoPath, type GalleryPhoto } from '@/lib/home3-gallery';

const source = (photo: GalleryPhoto, size: 640 | 'full' = 'full') =>
  assetPath(galleryPhotoPath(photo, size));

function Photo({ photo }: { photo: GalleryPhoto }) {
  const [ready, setReady] = useState(false);
  return (
    <img
      className="viewer-photo"
      src={source(photo)}
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      draggable={false}
      decoding="async"
      data-ready={ready}
      onLoad={() => setReady(true)}
    />
  );
}

export default function GalleryLightbox({
  photos,
  index,
  onIndexChange,
  returnFocusRef,
}: {
  photos: readonly GalleryPhoto[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const blankStart = useRef<{ id: number; x: number; y: number } | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const open = index !== null;
  const move = (direction: number) => {
    if (index !== null)
      onIndexChange((index + direction + photos.length) % photos.length);
  };

  useEffect(() => {
    if (index === null) return;
    const thumb = thumbRefs.current[index];
    if (thumb)
      thumb.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
        behavior: 'instant',
      });
    const neighbours = [-1, 1].map((offset) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = source(
        photos[(index + offset + photos.length) % photos.length],
      );
      return img;
    });
    return () => neighbours.forEach((img) => img.removeAttribute('src'));
  }, [index, photos]);

  // A click in empty space dismisses; a drag/swipe or a click on the photo does not.
  const blankDown = (event: PointerEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    blankStart.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  };
  const blankUp = (event: PointerEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    const start = blankStart.current;
    blankStart.current = null;
    if (
      start &&
      start.id === event.pointerId &&
      event.target === event.currentTarget &&
      Math.hypot(event.clientX - start.x, event.clientY - start.y) < 6
    )
      onIndexChange(null);
  };
  const blankEvents = {
    onPointerDown: blankDown,
    onPointerUp: blankUp,
    onPointerCancel: () => {
      blankStart.current = null;
    },
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!value) onIndexChange(null);
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="gallery-veil" />
        <Dialog.Popup
          className="gallery-viewer"
          initialFocus={closeRef}
          finalFocus={returnFocusRef}
          {...blankEvents}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
              event.preventDefault();
              move(event.key === 'ArrowRight' ? 1 : -1);
            }
          }}
        >
          <Dialog.Title className="sr-only">
            Foto’s van Foodbar Mouline
          </Dialog.Title>
          <header className="viewer-header">
            <output
              className="viewer-count"
              aria-live="polite"
              aria-atomic="true"
            >
              {`${(index ?? 0) + 1} / ${photos.length}`}
            </output>
            <Dialog.Close
              ref={closeRef}
              className="viewer-control viewer-close"
              aria-label="Galerij sluiten"
            >
              <X size={22} />
            </Dialog.Close>
          </header>
          <Dialog.Description className="sr-only">
            Blader met de pijltjestoetsen, kies een miniatuur of veeg over de
            foto. Sluit met Escape, de sluitknop of een tik naast de foto.
          </Dialog.Description>
          {index !== null && (
            <>
              <div
                className="viewer-stage"
                {...blankEvents}
                onTouchStart={(event) => {
                  touchStart.current =
                    event.touches.length === 1
                      ? {
                          x: event.touches[0].clientX,
                          y: event.touches[0].clientY,
                        }
                      : null;
                }}
                onTouchCancel={() => {
                  touchStart.current = null;
                }}
                onTouchEnd={(event) => {
                  const start = touchStart.current;
                  touchStart.current = null;
                  if (
                    !start ||
                    event.touches.length ||
                    !event.changedTouches.length
                  )
                    return;
                  const dx = event.changedTouches[0].clientX - start.x;
                  const dy = event.changedTouches[0].clientY - start.y;
                  if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.5)
                    move(dx < 0 ? 1 : -1);
                }}
              >
                <Photo key={photos[index].id} photo={photos[index]} />
                <button
                  type="button"
                  className="viewer-control viewer-previous"
                  aria-label="Vorige foto"
                  onClick={() => move(-1)}
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  className="viewer-control viewer-next"
                  aria-label="Volgende foto"
                  onClick={() => move(1)}
                >
                  <ChevronRight size={22} />
                </button>
              </div>
              <nav className="viewer-filmstrip" aria-label="Kies een foto">
                {photos.map((photo, i) => (
                  <button
                    key={photo.id}
                    type="button"
                    className="viewer-thumb"
                    ref={(element) => {
                      thumbRefs.current[i] = element;
                    }}
                    aria-label={`Toon foto ${i + 1}: ${photo.alt}`}
                    aria-current={i === index ? 'true' : undefined}
                    onClick={() => onIndexChange(i)}
                  >
                    <img
                      src={source(photo, 640)}
                      width={photo.width}
                      height={photo.height}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </nav>
            </>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
