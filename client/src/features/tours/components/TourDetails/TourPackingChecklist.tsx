import { useState, useEffect } from 'react';
import { CheckSquare, Square, RotateCcw, CheckCircle2, Luggage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Tour } from '@/features/tours/types';

interface ChecklistItem {
  id: string;
  category: string;
  label: string;
  required: boolean;
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  {
    id: 'nid',
    category: 'Documents & Cash',
    label: 'Original NID / Passport & 2 Photocopies',
    required: true,
  },
  {
    id: 'ticket',
    category: 'Documents & Cash',
    label: 'LTMS PDF Booking Confirmation Ticket',
    required: true,
  },
  {
    id: 'cash',
    category: 'Documents & Cash',
    label: 'Emergency Cash (BDT 2,000–5,000 for personal use)',
    required: true,
  },
  {
    id: 'shoes',
    category: 'Clothing & Footwear',
    label: 'Comfortable walking shoes or grip sneakers',
    required: true,
  },
  {
    id: 'jacket',
    category: 'Clothing & Footwear',
    label: 'Light jacket or warm layer (morning/night breeze)',
    required: false,
  },
  { id: 'hat', category: 'Clothing & Footwear', label: 'Sun hat & UV sunglasses', required: false },
  {
    id: 'powerbank',
    category: 'Electronics',
    label: 'Power bank (10,000 mAh or higher) with charging cables',
    required: true,
  },
  {
    id: 'waterproof',
    category: 'Electronics',
    label: 'Waterproof mobile pouch / dry bag',
    required: false,
  },
  {
    id: 'meds',
    category: 'Health & Personal Care',
    label: 'Personal daily prescription medications',
    required: true,
  },
  {
    id: 'sickness',
    category: 'Health & Personal Care',
    label: 'Motion sickness pills (for winding hill roads)',
    required: false,
  },
  {
    id: 'repellent',
    category: 'Health & Personal Care',
    label: 'Mosquito repellent cream (Odomos or similar)',
    required: false,
  },
  {
    id: 'ors',
    category: 'Health & Personal Care',
    label: 'Oral Rehydration Saline (ORS) & basic band-aids',
    required: false,
  },
];

export function TourPackingChecklist({ tour }: { tour: Tour }) {
  const storageKey = `ltms-checklist-${tour.slug}`;

  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(checkedIds));
    } catch {
      // Storage unavailable fallback
    }
  }, [checkedIds, storageKey]);

  const toggleItem = (id: string) => {
    setCheckedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleReset = () => {
    setCheckedIds({});
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  const totalCount = DEFAULT_ITEMS.length;
  const packedCount = DEFAULT_ITEMS.filter((item) => checkedIds[item.id]).length;
  const progressPercent = Math.round((packedCount / totalCount) * 100);
  const isComplete = packedCount === totalCount;

  // Group by category
  const categories = Array.from(new Set(DEFAULT_ITEMS.map((item) => item.category)));

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border shadow-xs">
      {/* Header */}
      <div className="border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Luggage className="text-primary size-4" />
          <h3 className="text-foreground text-sm font-semibold">
            Trip Packing Checklist & Essentials
          </h3>
          <Badge variant="secondary" className="text-[11px]">
            {packedCount} / {totalCount} Packed
          </Badge>
        </div>

        {packedCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground h-8 gap-1 px-2 text-xs"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        )}
      </div>

      <div className="p-5">
        {/* Progress Bar */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Packing Readiness</span>
            <span className="text-foreground font-semibold">
              {progressPercent}% {isComplete && '— Ready for Departure! 🎉'}
            </span>
          </div>
          <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
            <div
              className={`h-full transition-all duration-300 ${
                isComplete ? 'bg-emerald-500' : 'bg-primary'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Categories & Checklist items */}
        <div className="space-y-5">
          {categories.map((category) => {
            const items = DEFAULT_ITEMS.filter((i) => i.category === category);
            return (
              <div key={category} className="space-y-2">
                <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  {category}
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {items.map((item) => {
                    const isChecked = !!checkedIds[item.id];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-left transition-all ${
                          isChecked
                            ? 'text-foreground border-emerald-500/40 bg-emerald-500/5'
                            : 'border-border bg-background hover:bg-muted/40 text-foreground'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                        ) : (
                          <Square className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                        )}
                        <div className="flex-1">
                          <span
                            className={`text-xs ${
                              isChecked
                                ? 'text-muted-foreground line-through'
                                : 'text-foreground font-medium'
                            }`}
                          >
                            {item.label}
                          </span>
                          {item.required && !isChecked && (
                            <span className="text-destructive ml-1 text-[10px] font-semibold">
                              (Required)
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {isComplete && (
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              All essential items packed! Don&apos;t forget to bring your national ID to the
              boarding terminal.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
