import { lazy, Suspense } from 'react';
import { HeroSection } from '@/features/home/components/HeroSection';
import { PopularDestinations } from '@/features/home/components/PopularDestinations/PopularDestinations';
import { UpcomingEvents } from '@/features/home/components/UpcomingEvents/UpcomingEvents';
import { WhyChooseUs } from '@/features/home/components/WhyChooseUs';
import { TravelStats } from '@/features/home/components/TravelStats/TravelStats';
import { TourProcess } from '@/features/home/components/TourProcess';
import { CtaBanner } from '@/features/home/components/CtaBanner';
import { Newsletter } from '@/features/home/components/Newsletter';
import { Skeleton } from '@/components/ui/skeleton';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Section } from '@/components/layout/Section';

const AboutSection = lazy(() =>
  import('@/features/home/components/AboutSection').then((m) => ({ default: m.AboutSection })),
);

const GalleryPreview = lazy(() =>
  import('@/features/home/components/GalleryPreview').then((m) => ({ default: m.GalleryPreview })),
);

const ReviewsPreview = lazy(() =>
  import('@/features/home/components/ReviewsPreview/ReviewsPreview').then((m) => ({
    default: m.ReviewsPreview,
  })),
);

const FaqPreview = lazy(() =>
  import('@/features/home/components/FaqPreview').then((m) => ({ default: m.FaqPreview })),
);

const ContactSection = lazy(() =>
  import('@/features/home/components/ContactSection').then((m) => ({ default: m.ContactSection })),
);

/** Generic fallback shown while a lazy section's chunk is loading. */
function SectionSkeleton() {
  return (
    <Section>
      <Skeleton className="mx-auto h-8 w-64" />
      <div className="laptop:grid-cols-4 mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    </Section>
  );
}

/**
 * The commercial home page. Every section is a self-contained component
 * composing verified company services, real backend-connected upcoming events,
 * travel gallery, verified guest reviews, about narrative, and contact inquiries.
 */
export function HomePage() {
  return (
    <PageWrapper>
      <HeroSection />
      <PopularDestinations />
      <UpcomingEvents />
      <WhyChooseUs />
      <Suspense fallback={<SectionSkeleton />}>
        <AboutSection />
      </Suspense>
      <TravelStats />
      <Suspense fallback={<SectionSkeleton />}>
        <GalleryPreview />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <ReviewsPreview />
      </Suspense>
      <TourProcess />
      <CtaBanner />
      <Suspense fallback={<SectionSkeleton />}>
        <FaqPreview />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <ContactSection />
      </Suspense>
      <Newsletter />
    </PageWrapper>
  );
}
