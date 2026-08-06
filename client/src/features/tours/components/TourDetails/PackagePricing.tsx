import { Check } from 'lucide-react';
import type { TourPackage } from '@/features/tours/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatBDT } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface PackagePricingProps {
  packages: TourPackage[];
}

/** Renders nothing if the tour has no packages defined — not every tour (e.g. simple day trips) uses tiered pricing. */
function PackagePricing({ packages }: PackagePricingProps) {
  if (packages.length === 0) return null;

  return (
    <div className="laptop:grid-cols-3 grid grid-cols-1 gap-5 sm:grid-cols-2">
      {packages.map((pkg) => {
        const isPremium = pkg.tier === 'premium';
        return (
          <Card
            key={pkg.id}
            className={cn('flex flex-col', isPremium && 'border-primary shadow-md')}
          >
            <CardHeader className="gap-2">
              {isPremium && (
                <Badge variant="warning" className="w-fit">
                  Most Popular
                </Badge>
              )}
              <CardTitle>{pkg.name}</CardTitle>
              <p className="text-muted-foreground text-sm">{pkg.description}</p>
              <p className="font-display text-primary text-2xl font-semibold">
                {formatBDT(pkg.priceBDT)}
              </p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <ul className="flex flex-1 flex-col gap-2">
                {pkg.inclusions.map((item) => (
                  <li key={item} className="text-foreground flex items-start gap-2 text-sm">
                    <Check className="text-success-600 mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant={isPremium ? 'default' : 'outline'} className="w-full">
                Select {pkg.name}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export { PackagePricing };
