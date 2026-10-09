import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Calculator, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Tour } from '@/features/tours/types';

interface AddonOption {
  id: string;
  name: string;
  pricePerPerson?: number;
  fixedPrice?: number;
}

const TOUR_ADDONS: AddonOption[] = [
  { id: 'bbq', name: 'Special Hillside BBQ Dinner', pricePerPerson: 500 },
  { id: 'window', name: 'Scenic Jeep Front / Window Seat', pricePerPerson: 600 },
  { id: 'photo', name: 'Photo & Drone Video Package (Group)', fixedPrice: 1500 },
];

export function TourCostCalculator({ tour }: { tour: Tour }) {
  const packages = tour.packages || [];
  const [selectedPackageId, setSelectedPackageId] = useState<string>(packages[0]?.id || 'default');

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});

  const activePackage = packages.find((p) => p.id === selectedPackageId) || packages[0];
  const basePrice = activePackage?.priceBDT ?? tour.startingPriceBDT;

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const calculation = useMemo(() => {
    const adultTotal = adults * basePrice;
    // Children under 6 pay 50% for shared amenities
    const childTotal = Math.round(children * basePrice * 0.5);

    let addonTotal = 0;
    TOUR_ADDONS.forEach((addon) => {
      if (selectedAddons[addon.id]) {
        if (addon.pricePerPerson) {
          addonTotal += addon.pricePerPerson * (adults + children);
        } else if (addon.fixedPrice) {
          addonTotal += addon.fixedPrice;
        }
      }
    });

    const grandTotal = adultTotal + childTotal + addonTotal;
    const advanceDeposit = Math.round(grandTotal * 0.2); // 20% advance
    const remainingDue = grandTotal - advanceDeposit;

    return {
      adultTotal,
      childTotal,
      addonTotal,
      grandTotal,
      advanceDeposit,
      remainingDue,
    };
  }, [adults, children, basePrice, selectedAddons]);

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border shadow-xs">
      {/* Header */}
      <div className="border-border bg-muted/30 flex items-center justify-between border-b px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Calculator className="text-primary size-4" />
          <h3 className="text-foreground text-sm font-semibold">
            Group Cost & Advance Deposit Calculator
          </h3>
        </div>
        <Badge variant="outline" className="text-[11px]">
          Transparent Pricing
        </Badge>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Controls */}
          <div className="space-y-5 lg:col-span-7">
            {/* Package selector */}
            {packages.length > 0 && (
              <div>
                <p className="text-foreground text-xs font-semibold">Select Package Tier</p>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {packages.map((pkg) => {
                    const isSelected = pkg.id === selectedPackageId;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`rounded-lg border p-2.5 text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary shadow-xs'
                            : 'border-border bg-background hover:bg-muted/40 text-foreground'
                        }`}
                      >
                        <p className="text-xs font-semibold">{pkg.name}</p>
                        <p className="text-foreground mt-1 text-xs font-bold">
                          ৳{pkg.priceBDT.toLocaleString()}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Travelers counter */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Adults */}
              <div className="border-border/80 bg-background rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground text-xs font-semibold">Adults</p>
                    <p className="text-muted-foreground text-[10px]">Ages 12+</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-7"
                      onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="text-foreground w-5 text-center text-sm font-bold">
                      {adults}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-7"
                      onClick={() => setAdults((prev) => Math.min(15, prev + 1))}
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Children */}
              <div className="border-border/80 bg-background rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground text-xs font-semibold">Children</p>
                    <p className="text-muted-foreground text-[10px]">Ages 3–11 (50% fare)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-7"
                      onClick={() => setChildren((prev) => Math.max(0, prev - 1))}
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="text-foreground w-5 text-center text-sm font-bold">
                      {children}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-7"
                      onClick={() => setChildren((prev) => Math.min(8, prev + 1))}
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Add-ons */}
            <div>
              <p className="text-foreground text-xs font-semibold">Optional Trip Add-ons</p>
              <div className="mt-2 space-y-2">
                {TOUR_ADDONS.map((addon) => {
                  const isChecked = !!selectedAddons[addon.id];
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon.id)}
                      className={`flex w-full items-center justify-between rounded-lg border p-2.5 text-left text-xs transition-all ${
                        isChecked
                          ? 'border-primary/50 bg-primary/5 font-medium'
                          : 'border-border bg-background hover:bg-muted/40'
                      }`}
                    >
                      <span>{addon.name}</span>
                      <span className="text-primary font-semibold">
                        +৳
                        {(addon.pricePerPerson
                          ? addon.pricePerPerson * (adults + children)
                          : addon.fixedPrice || 0
                        ).toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Summary Card */}
          <div className="border-border/80 bg-muted/30 flex flex-col justify-between rounded-xl border p-4 lg:col-span-5">
            <div>
              <p className="text-foreground text-xs font-semibold tracking-wider uppercase">
                Cost Breakdown
              </p>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Adults ({adults} × ৳{basePrice.toLocaleString()}):
                  </span>
                  <span className="text-foreground font-medium">
                    ৳{calculation.adultTotal.toLocaleString()}
                  </span>
                </div>

                {children > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Children ({children} × 50% fare):</span>
                    <span className="text-foreground font-medium">
                      ৳{calculation.childTotal.toLocaleString()}
                    </span>
                  </div>
                )}

                {calculation.addonTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience Add-ons:</span>
                    <span className="text-foreground font-medium">
                      ৳{calculation.addonTotal.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="border-border my-2 border-t pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-bold">Estimated Total:</span>
                    <span className="text-primary font-display text-lg font-bold">
                      ৳{calculation.grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Deposit Details */}
                <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                      20% Advance to Lock Seats:
                    </span>
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">
                      ৳{calculation.advanceDeposit.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-muted-foreground mt-1 flex justify-between text-[11px]">
                    <span>Due at Departure Boarding:</span>
                    <span>৳{calculation.remainingDue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <Button asChild className="w-full">
                <Link to={`/booking?slug=${tour.slug}`}>
                  Proceed to Seat Booking
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <p className="text-muted-foreground flex items-center justify-center gap-1 text-[11px]">
                <ShieldCheck className="size-3 text-emerald-500" />
                Instant seat locking with 10-minute timer guarantee
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
