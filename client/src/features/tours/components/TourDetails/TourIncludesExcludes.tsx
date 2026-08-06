import { Check, X } from 'lucide-react';

export interface TourIncludesExcludesProps {
  includes?: string[];
  excludes?: string[];
}

function TourIncludesExcludes({ includes, excludes }: TourIncludesExcludesProps) {
  if (!includes?.length && !excludes?.length) return null;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {includes && includes.length > 0 && (
        <div>
          <h3 className="font-display text-foreground mb-3 text-base font-semibold">
            Tour Includes
          </h3>
          <ul className="flex flex-col gap-2">
            {includes.map((item) => (
              <li key={item} className="text-foreground flex items-start gap-2 text-sm">
                <Check className="text-success-600 mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      {excludes && excludes.length > 0 && (
        <div>
          <h3 className="font-display text-foreground mb-3 text-base font-semibold">
            Tour Excludes
          </h3>
          <ul className="flex flex-col gap-2">
            {excludes.map((item) => (
              <li key={item} className="text-foreground flex items-start gap-2 text-sm">
                <X className="text-danger-600 mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export { TourIncludesExcludes };
