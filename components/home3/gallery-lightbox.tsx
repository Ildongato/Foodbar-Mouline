'use client';
/* oxlint-disable nextjs/no-img-element -- Full-resolution local assets in the static Pages entry. */
import { useEffect, useRef, useState, type RefObject } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { assetPath } from '@/lib/hosting';

type GalleryPhoto = { name: string; alt: string };
const photoSource = (photo: GalleryPhoto) =>
  assetPath(`/images/${photo.name}-1280.webp`);

function LightboxImage({ photo }: { photo: GalleryPhoto }) {
  const [ready, setReady] = useState(false);
  return (
    <img
      src={photoSource(photo)}
      alt={photo.alt}
      loading="eager"
      decoding="async"
      draggable={false}
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
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const move = (direction: number) => {
    if (index !== null)
      onIndexChange((index + direction + photos.length) % photos.length);
  };

  useEffect(() => {
    if (index === null) return;
    // Only neighbours are prefetched; the visible image owns its own request.
    const neighbours = [-1, 1].map((offset) => {
      const image = new Image();
      image.decoding = 'async';
      image.src = photoSource(
        photos[(index + offset + photos.length) % photos.length],
      );
      return image;
    });
    return () => neighbours.forEach((image) => image.removeAttribute('src'));
  }, [index, photos]);

  return (
    <Dialog
      open={index !== null}
      onOpenChange={(open) => {
        if (!open) onIndexChange(null);
      }}
    >
      <DialogContent
        className="lightbox translate-x-0 translate-y-0"
        aria-modal="true"
        showCloseButton={false}
        initialFocus={closeRef}
        finalFocus={returnFocusRef}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            move(event.key === 'ArrowRight' ? 1 : -1);
          }
        }}
      >
        <DialogTitle className="sr-only">
          Foto’s van Foodbar Mouline
        </DialogTitle>
        <DialogDescription className="sr-only">
          Blader met de pijltjestoetsen of veeg over de foto. Sluit met Escape.
        </DialogDescription>
        <DialogClose
          ref={closeRef}
          className="lightbox-close lightbox-control"
          aria-label="Foto sluiten"
        >
          <X size={24} />
        </DialogClose>
        {index !== null && (
          <>
            <div
              className="lightbox-stage"
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
              <LightboxImage key={photos[index].name} photo={photos[index]} />
            </div>
            <button
              type="button"
              className="lightbox-previous lightbox-control"
              aria-label="Vorige galerijfoto"
              onClick={() => move(-1)}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              className="lightbox-next lightbox-control"
              aria-label="Volgende galerijfoto"
              onClick={() => move(1)}
            >
              <ChevronRight size={24} />
            </button>
            <output
              className="lightbox-count"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="sr-only">Foto </span>
              {index + 1} / {photos.length}
            </output>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
