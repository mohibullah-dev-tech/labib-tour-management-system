import { motion } from 'framer-motion';
import { PackageCard } from '@/features/booking/components/PackageCard';
import { useBooking } from '@/features/booking/hooks/useBooking';
import { Button } from '@/components/ui/button';
import { staggerContainer } from '@/lib/animations/variants';

/** Step 2 — Single / Couple / Premium / VIP, priced dynamically from the selected event's own package data. */
function SelectPackageStep() {
  const { draft, selectPackage, goBack } = useBooking();

  if (!draft.event) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-foreground text-xl font-semibold">Select a Package</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Pricing for <span className="text-foreground font-medium">{draft.event.tourName}</span>
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="laptop:grid-cols-4 grid grid-cols-1 gap-5 sm:grid-cols-2"
      >
        {draft.event.packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            packageOption={pkg}
            isSelected={draft.packageOption?.id === pkg.id}
            onSelect={selectPackage}
          />
        ))}
      </motion.div>

      <div>
        <Button variant="outline" onClick={goBack}>
          Back
        </Button>
      </div>
    </div>
  );
}

export { SelectPackageStep };
