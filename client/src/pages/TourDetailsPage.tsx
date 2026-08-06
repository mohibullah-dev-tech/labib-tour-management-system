import { useParams, Link } from 'react-router';
import type { ReactNode } from 'react';
import { Compass } from 'lucide-react';
import { TOURS } from '@/features/tours/data/tours';
import { TourHeroBanner } from '@/features/tours/components/TourDetails/TourHeroBanner';
import { QuickOverview } from '@/features/tours/components/TourDetails/QuickOverview';
import { ImageGallery } from '@/features/tours/components/TourDetails/ImageGallery';
import { PackagePricing } from '@/features/tours/components/TourDetails/PackagePricing';
import { TourIncludesExcludes } from '@/features/tours/components/TourDetails/TourIncludesExcludes';
import { FoodMenu } from '@/features/tours/components/TourDetails/FoodMenu';
import { TravelTimeline } from '@/features/tours/components/TourDetails/TravelTimeline';
import { PlacesToVisit } from '@/features/tours/components/TourDetails/PlacesToVisit';
import { RouteMapPlaceholder } from '@/features/tours/components/TourDetails/RouteMapPlaceholder';
import { HotelInfo } from '@/features/tours/components/TourDetails/HotelInfo';
import { HostInfo } from '@/features/tours/components/TourDetails/HostInfo';
import { TourReviews } from '@/features/tours/components/TourDetails/TourReviews';
import { RelatedTours } from '@/features/tours/components/TourDetails/RelatedTours';
import { TourFaq } from '@/features/tours/components/TourDetails/TourFaq';
import { StickyBookingSummary } from '@/features/tours/components/TourDetails/StickyBookingSummary';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Section } from '@/components/layout/Section';
import { SectionTitle } from '@/components/common/SectionTitle';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';

/** A detail sub-section that only renders (heading included) when its data actually exists. */
function DetailBlock({
  title,
  show,
  children,
}: {
  title: string;
  show: boolean;
  children: ReactNode;
}) {
  if (!show) return null;
  return (
    <div>
      <h2 className="font-display text-foreground mb-4 text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}

/**
 * Tour Details page — looks up the tour by `slug` from the shared TOURS
 * catalog. Every section below is conditionally rendered based on
 * whether that tour's data actually has it, since real tours (a Day
 * Tour vs. a multi-day Premium tour) won't all populate every field —
 * see features/tours/types.ts for which fields are optional and why.
 */
export function TourDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const tour = TOURS.find((t) => t.slug === slug);

  if (!tour) {
    return (
      <PageWrapper>
        <Section>
          <EmptyState
            icon={Compass}
            title="Tour not found"
            description="This tour may have been removed or the link is incorrect."
            action={
              <Button asChild>
                <Link to="/tours">Browse All Tours</Link>
              </Button>
            }
          />
        </Section>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="laptop:pb-0 pb-24">
      <TourHeroBanner tour={tour} />

      <Section>
        <div className="laptop:grid-cols-[1fr_340px] grid grid-cols-1 gap-10">
          <div className="flex flex-col gap-10">
            <QuickOverview tour={tour} />

            <div>
              <h2 className="font-display text-foreground mb-3 text-xl font-semibold">Overview</h2>
              <p className="text-muted-foreground leading-relaxed">{tour.longDescription}</p>
            </div>

            <DetailBlock title="Gallery" show={tour.gallery.length > 0}>
              <ImageGallery images={tour.gallery} tourName={tour.name} />
            </DetailBlock>

            <DetailBlock title="Package Pricing" show={!!tour.packages?.length}>
              <PackagePricing packages={tour.packages ?? []} />
            </DetailBlock>

            <TourIncludesExcludes includes={tour.includes} excludes={tour.excludes} />

            <DetailBlock title="Food Menu" show={!!tour.foodMenu?.length}>
              <FoodMenu menu={tour.foodMenu} />
            </DetailBlock>

            <DetailBlock title="Travel Plan" show={!!tour.route?.length}>
              <TravelTimeline route={tour.route} />
            </DetailBlock>

            <DetailBlock title="Places to Visit" show={!!tour.placesToVisit?.length}>
              <PlacesToVisit places={tour.placesToVisit} />
            </DetailBlock>

            <DetailBlock title="Route Map" show={!!tour.route?.length}>
              <RouteMapPlaceholder route={tour.route} />
            </DetailBlock>

            <DetailBlock title="Hotel Information" show={!!tour.hotel}>
              <HotelInfo hotel={tour.hotel} />
            </DetailBlock>

            <DetailBlock title="Your Host" show={!!tour.host}>
              <HostInfo host={tour.host} />
            </DetailBlock>

            <DetailBlock title="Guest Reviews" show={!!tour.reviews?.length}>
              <TourReviews reviews={tour.reviews} />
            </DetailBlock>

            <DetailBlock title="Frequently Asked Questions" show={!!tour.faq?.length}>
              <TourFaq faq={tour.faq} />
            </DetailBlock>
          </div>

          <div>
            <StickyBookingSummary tour={tour} />
          </div>
        </div>
      </Section>

      {!!tour.relatedTourIds?.length && (
        <Section className="bg-muted/40" aria-labelledby="related-tours-heading">
          <SectionTitle
            id="related-tours-heading"
            eyebrow="You Might Also Like"
            title="Related Tours"
          />
          <div className="mt-8">
            <RelatedTours relatedTourIds={tour.relatedTourIds} />
          </div>
        </Section>
      )}
    </PageWrapper>
  );
}
