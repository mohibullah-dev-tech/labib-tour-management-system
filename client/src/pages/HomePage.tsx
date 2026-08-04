import { PageWrapper } from '@/components/layout/PageWrapper';
import { Section } from '@/components/layout/Section';
import { H1, Lead } from '@/components/ui/typography';

/**
 * Placeholder route — intentionally minimal. Home page sections (Hero,
 * featured tours, testimonials, etc.) are explicitly out of scope for
 * this phase and will be built next.
 */
export function HomePage() {
  return (
    <PageWrapper>
      <Section>
        <H1>Labib Tour Management System</H1>
        <Lead className="mt-3">Home page content will be built in an upcoming phase.</Lead>
      </Section>
    </PageWrapper>
  );
}
