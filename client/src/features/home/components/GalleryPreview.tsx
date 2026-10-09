import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { SectionTitle } from '@/components/common/SectionTitle';
import { LazyImage } from '@/components/common/LazyImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  GALLERY_IMAGES,
  GALLERY_CATEGORIES,
  type GalleryCategory,
  type GalleryImage,
} from '@/features/home/data/gallery';
import { fadeIn, staggerContainer } from '@/lib/animations/variants';

function GalleryPreview() {
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory>('All');
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const filteredImages = useMemo(() => {
    if (selectedCategory === 'All') return GALLERY_IMAGES;
    return GALLERY_IMAGES.filter((img) => img.category === selectedCategory);
  }, [selectedCategory]);

  const activeImage: GalleryImage | null =
    activeImageIndex !== null ? (filteredImages[activeImageIndex] ?? null) : null;

  const handleOpenLightbox = (index: number) => {
    setActiveImageIndex(index);
  };

  const handleCloseLightbox = () => {
    setActiveImageIndex(null);
  };

  const handleNext = () => {
    if (activeImageIndex === null) return;
    setActiveImageIndex((activeImageIndex + 1) % filteredImages.length);
  };

  const handlePrev = () => {
    if (activeImageIndex === null) return;
    setActiveImageIndex((activeImageIndex - 1 + filteredImages.length) % filteredImages.length);
  };

  return (
    <Section id="gallery" aria-labelledby="gallery-heading" className="scroll-mt-20">
      <SectionTitle
        id="gallery-heading"
        eyebrow="Moments From The Road"
        title="Travel Gallery"
        description="Breathtaking destinations, cloud-wrapped hills, and coastlines captured across Bangladesh."
      />

      {/* Category Filter Pills */}
      <div
        className="no-scrollbar mt-8 flex flex-wrap items-center justify-center gap-2"
        role="tablist"
        aria-label="Gallery category filters"
      >
        {GALLERY_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 sm:text-sm ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Images Grid */}
      <motion.div
        layout
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredImages.map((item, idx) => (
            <motion.figure
              layout
              key={item.id}
              variants={fadeIn}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              tabIndex={0}
              role="button"
              aria-label={`View photo: ${item.alt}, located in ${item.location}`}
              onClick={() => handleOpenLightbox(idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenLightbox(idx);
                }
              }}
              className="group border-border bg-card focus-visible:ring-primary relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md focus-visible:ring-2 focus-visible:outline-none"
            >
              <LazyImage
                src={item.image}
                alt={item.alt}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90" />

              {/* Badges and label */}
              <div className="absolute top-3 left-3">
                <Badge
                  variant="secondary"
                  className="bg-background/80 text-[10px] backdrop-blur-xs"
                >
                  {item.category}
                </Badge>
              </div>

              <div className="absolute right-3 bottom-3 left-3 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-300">
                    <MapPin className="size-3 shrink-0" />
                    <span>{item.location}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-white drop-shadow-xs">
                    {item.alt}
                  </p>
                </div>
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-xs transition-transform group-hover:scale-110">
                  <Maximize2 className="size-3.5" />
                </div>
              </div>
            </motion.figure>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox Dialog */}
      <Dialog open={activeImage !== null} onOpenChange={(open) => !open && handleCloseLightbox()}>
        <DialogContent className="border-border max-w-4xl overflow-hidden bg-neutral-950/95 p-0 text-white sm:rounded-2xl">
          {activeImage && (
            <div className="relative flex flex-col">
              <div className="relative aspect-[16/10] max-h-[70vh] w-full overflow-hidden bg-black/50">
                <img
                  src={activeImage.image}
                  alt={activeImage.alt}
                  className="size-full object-contain"
                />

                {/* Prev / Next controls */}
                {filteredImages.length > 1 && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                      }}
                      className="absolute top-1/2 left-3 size-9 -translate-y-1/2 rounded-full bg-black/60 text-white hover:bg-black/90 hover:text-white"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="size-5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      className="absolute top-1/2 right-3 size-9 -translate-y-1/2 rounded-full bg-black/60 text-white hover:bg-black/90 hover:text-white"
                      aria-label="Next image"
                    >
                      <ChevronRight className="size-5" />
                    </Button>
                  </>
                )}
              </div>

              {/* Lightbox Caption */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-neutral-900/80 px-6 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-white/30 text-[10px] text-white">
                      {activeImage.category}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-neutral-300">
                      <MapPin className="size-3" />
                      {activeImage.location}
                    </span>
                  </div>
                  <DialogTitle className="mt-1 text-base font-semibold text-white">
                    {activeImage.alt}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Image details for {activeImage.alt}
                  </DialogDescription>
                </div>
                <span className="text-xs text-neutral-400">
                  {(activeImageIndex ?? 0) + 1} / {filteredImages.length}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Section>
  );
}

export { GalleryPreview };
