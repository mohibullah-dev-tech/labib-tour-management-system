import { Caption, H2, Lead } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

export interface SectionTitleProps {
  /** Small uppercase label above the heading, e.g. "DESTINATIONS". */
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

/**
 * SectionTitle — the recurring eyebrow + heading + description pattern
 * used to introduce page sections. Kept content-driven (props, not
 * children) so every section title in the app stays visually identical.
 */
function SectionTitle({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {eyebrow && <Caption className="text-primary">{eyebrow}</Caption>}
      <H2>{title}</H2>
      {description && <Lead className="max-w-2xl">{description}</Lead>}
    </div>
  );
}

export { SectionTitle };
