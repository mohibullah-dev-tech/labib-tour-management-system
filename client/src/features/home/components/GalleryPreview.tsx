import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Section } from '@/components/layout/Section';
import { SectionTitle } from '@/components/common/SectionTitle';
import { LazyImage } from '@/components/common/LazyImage';
import { Button } from '@/components/ui/button';
import { GALLERY_IMAGES } from '@/features/home/data/gallery';
import { staggerContainer, fadeIn } from '@/lib/animations/variants';

/**
 * CSS-columns masonry (not a JS grid library) — items reflow into balanced
 * columns purely via `columns-*` + `break-inside-avoid`, no measuring,
 * no layout-thrashing on resize. Simplest tool that actually solves this,
 * per KISS.
 */
function GalleryPreview() {
  return (
    <Section aria-labelledby="gallery-heading">
      <SectionTitle
        id="gallery-heading"
        eyebrow="Moments From The Road"
        title="Gallery"
        description="Mountains, sea, waterfalls, and everything in between."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="laptop:columns-3 mt-10 columns-2 gap-4"
      >
        {GALLERY_IMAGES.map((item) => (
          <motion.figure
            key={item.id}
            variants={fadeIn}
            className="mb-4 break-inside-avoid overflow-hidden rounded-lg"
          >
            <LazyImage
              src={item.image}
              alt={item.alt}
              className="transition-transform duration-500 hover:scale-105"
            />
            <figcaption className="sr-only">{item.category}</figcaption>
          </motion.figure>
        ))}
      </motion.div>

      <div className="mt-8 flex justify-center">
        <Button variant="outline" asChild>
          <Link to="/gallery">View Full Gallery</Link>
        </Button>
      </div>
    </Section>
  );
}

export { GalleryPreview };
