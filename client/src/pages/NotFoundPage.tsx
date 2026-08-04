import { Link } from 'react-router';
import { Compass } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Section } from '@/components/layout/Section';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <PageWrapper>
      <Section>
        <EmptyState
          icon={Compass}
          title="Page not found"
          description="The page you're looking for doesn't exist or has moved."
          action={
            <Button asChild>
              <Link to="/">Back to home</Link>
            </Button>
          }
        />
      </Section>
    </PageWrapper>
  );
}
