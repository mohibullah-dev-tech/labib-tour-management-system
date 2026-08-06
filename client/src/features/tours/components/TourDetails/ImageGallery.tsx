import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { LazyImage } from '@/components/common/LazyImage';

export interface ImageGalleryProps {
  images: string[];
  tourName: string;
}

/**
 * A simple responsive grid that opens a full-size Dialog (reusing the
 * design system's existing Modal, not a new lightbox library) when an
 * image is clicked — keyboard-operable and dismissible with Escape for
 * free, since Dialog already handles that.
 */
function ImageGallery({ images, tourName }: ImageGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className="laptop:grid-cols-5 grid grid-cols-3 gap-2">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="overflow-hidden rounded-md"
            aria-label={`View image ${i + 1} of ${tourName}`}
          >
            <LazyImage
              src={src}
              alt={`${tourName} — view ${i + 1}`}
              aspectClassName="aspect-square"
              className="transition-transform duration-300 hover:scale-105"
            />
          </button>
        ))}
      </div>

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="max-w-3xl border-0 bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">
            {tourName} gallery image {openIndex !== null ? openIndex + 1 : ''}
          </DialogTitle>
          {openIndex !== null && (
            <img
              src={images[openIndex]}
              alt={`${tourName} — view ${openIndex + 1}`}
              className="max-h-[80vh] w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export { ImageGallery };
