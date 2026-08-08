import { memo } from 'react';
import { Check } from 'lucide-react';
import type { BookingPackageOption } from '@/features/booking/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatBDT } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface PackageCardProps {
  packageOption: BookingPackageOption;
  isSelected: boolean;
  onSelect: (packageOption: BookingPackageOption) => void;
}

/** Step 2's package tier card — Single / Couple / Premium / VIP, price displayed dynamically from the event's own package data. */
const PackageCard = memo(function PackageCard({
  packageOption,
  isSelected,
  onSelect,
}: PackageCardProps) {
  const isVip = packageOption.tier === 'vip';

  return (
    <Card
      className={cn(
        'flex flex-col transition-colors',
        isSelected ? 'border-primary ring-primary/20 shadow-md ring-2' : undefined,
      )}
    >
      <CardHeader className="gap-2">
        {isVip && (
          <Badge variant="warning" className="w-fit">
            Best Experience
          </Badge>
        )}
        <CardTitle>{packageOption.name}</CardTitle>
        <p className="text-muted-foreground text-sm">{packageOption.description}</p>
        <p className="font-display text-primary text-2xl font-semibold">
          {formatBDT(packageOption.pricePerPersonBDT)}
          <span className="text-muted-foreground ml-1 text-sm font-normal">/ person</span>
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <ul className="flex flex-1 flex-col gap-2">
          {packageOption.inclusions.map((item) => (
            <li key={item} className="text-foreground flex items-start gap-2 text-sm">
              <Check className="text-success-600 mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <Button
          variant={isSelected ? 'default' : 'outline'}
          className="w-full"
          onClick={() => onSelect(packageOption)}
          aria-pressed={isSelected}
        >
          {isSelected ? 'Selected' : `Choose ${packageOption.name}`}
        </Button>
      </CardContent>
    </Card>
  );
});

export { PackageCard };
