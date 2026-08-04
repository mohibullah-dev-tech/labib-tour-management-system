import { Construction } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Section } from '@/components/layout/Section';
import { EmptyState } from '@/components/common/EmptyState';

export interface ComingSoonPageProps {
  title: string;
}

/**
 * Generic placeholder rendered for every nav destination that doesn't
 * have real business logic/content yet (Tours, Events, Gallery, Reviews,
 * About, Contact). This is layout scaffolding, not a feature page — it
 * exists purely so Navbar links resolve to something real instead of a
 * 404, satisfying "Active Route Highlight" for routes that aren't built
 * yet. Each will be replaced by its real feature page in a later phase.
 */
function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <PageWrapper>
      <Section>
        <EmptyState icon={Construction} title={title} description="This page is coming soon." />
      </Section>
    </PageWrapper>
  );
}

export { ComingSoonPage };
