import { useMemo } from 'react';
import { Signal, CreditCard, Sun, Truck, FileText, Info } from 'lucide-react';
import type { Tour } from '@/features/tours/types';

interface AdvisoryDetails {
  seasonAdvice: string;
  bestSeason: string;
  checkpostNotice: string;
  networkSignal: {
    gp: 'Strong' | 'Moderate' | 'Weak' | 'No Signal';
    robi: 'Strong' | 'Moderate' | 'Weak' | 'No Signal';
    teletalk: 'Strong' | 'Moderate' | 'Weak' | 'No Signal';
    bl: 'Strong' | 'Moderate' | 'Weak' | 'No Signal';
  };
  cashAtmNotice: string;
  localTransport: string;
}

const DESTINATION_ADVISORIES: Record<string, AdvisoryDetails> = {
  sajek: {
    bestSeason: 'September – February (Cloud Valley Season)',
    seasonAdvice:
      'Early morning cloud blankets the valley around 5:30 AM to 7:00 AM. Temperatures dip at night; carry a light jacket.',
    checkpostNotice:
      'Army escort timings from Dighinala/Baghaichari are strictly at 10:00 AM and 3:00 PM. Keep 2 photocopies of your NID.',
    networkSignal: {
      gp: 'Moderate',
      robi: 'Strong',
      teletalk: 'Strong',
      bl: 'Weak',
    },
    cashAtmNotice:
      'No ATM booths inside Sajek Valley. Withdraw emergency cash at Khagrachari town before boarding the hill jeep.',
    localTransport: 'Open 4WD Chander Gari (Jeep) with authorized local driver.',
  },
  bandarban: {
    bestSeason: 'October – March (Trekking Season)',
    seasonAdvice:
      'Ideal for hill hikes to Nilgiri and Nafakhum. Monsoon brings heavy waterfalls but trekking trails become slippery.',
    checkpostNotice:
      'Army and BGB security checkposts require tourist registration. Mandatory guide provided by Labib Tour.',
    networkSignal: {
      gp: 'Strong',
      robi: 'Strong',
      teletalk: 'Moderate',
      bl: 'Moderate',
    },
    cashAtmNotice:
      'ATMs available in Bandarban town, but none in remote Thanchi or Remakri trails.',
    localTransport: 'Four-wheel drive jeep and local engine-powered wooden boats in Sangu river.',
  },
  'coxs-bazar': {
    bestSeason: 'November – March (Pleasant Beach Weather)',
    seasonAdvice:
      'Gentle sea breeze and calm waves. Follow beach flag warnings before swimming. Sunset is around 5:30 PM.',
    checkpostNotice:
      'Open tourist zone. Keep identification handy for hotel check-in and highway boarding.',
    networkSignal: {
      gp: 'Strong',
      robi: 'Strong',
      teletalk: 'Strong',
      bl: 'Strong',
    },
    cashAtmNotice:
      'Abundant ATMs and MFS agents (bKash/Nagad) across Laboni, Kolatoli, and Sugandha beaches.',
    localTransport: 'AC highway bus, battery-operated Tomtom auto-rickshaws, and beach jeeps.',
  },
  haor: {
    bestSeason: 'July – September (High Water Monsoon)',
    seasonAdvice:
      'The haor fills into an inland sea during monsoon. Always wear your life vest while cruising or swimming.',
    checkpostNotice:
      'Tourist police patrol active around Watch Tower and Shimul Bagan. Keep ID photocopies.',
    networkSignal: {
      gp: 'Moderate',
      robi: 'Strong',
      teletalk: 'Moderate',
      bl: 'Weak',
    },
    cashAtmNotice: 'Limited ATMs in Sunamganj town; none on the houseboats or water checkpoints.',
    localTransport: 'Traditional wooden houseboat or engine trawler equipped with life jackets.',
  },
  sreemangal: {
    bestSeason: 'Year-round (Best: October – February & Monsoons for lush tea)',
    seasonAdvice:
      'Lush green tea gardens and Lawachara rainforest canopy. Carry insect repellent and walking shoes.',
    checkpostNotice: 'Standard forest beat registration included with our package.',
    networkSignal: {
      gp: 'Strong',
      robi: 'Strong',
      teletalk: 'Strong',
      bl: 'Strong',
    },
    cashAtmNotice: 'ATMs widely available throughout Sreemangal town center.',
    localTransport: 'Covered tourist microbuses and local open jeeps for off-road trails.',
  },
};

export function DestinationAdvisory({ tour }: { tour: Tour }) {
  const destinationKey = useMemo(() => {
    const text = `${tour.destination} ${tour.slug}`.toLowerCase();
    if (text.includes('sajek')) return 'sajek';
    if (text.includes('bandarban')) return 'bandarban';
    if (text.includes('cox')) return 'coxs-bazar';
    if (text.includes('haor') || text.includes('sunamganj')) return 'haor';
    if (text.includes('sreemangal') || text.includes('sylhet')) return 'sreemangal';
    return 'sajek';
  }, [tour]);

  const advisory = DESTINATION_ADVISORIES[destinationKey] ?? DESTINATION_ADVISORIES.sajek;

  const getSignalBadgeColor = (sig: string) => {
    switch (sig) {
      case 'Strong':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'Moderate':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border shadow-xs">
      <div className="border-border bg-muted/30 flex items-center justify-between border-b px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Info className="text-primary size-4" />
          <h3 className="text-foreground text-sm font-semibold">
            Destination Travel Advisory & Essentials
          </h3>
        </div>
        <span className="text-muted-foreground text-xs">{tour.destination}</span>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Best Season & Climate */}
          <div className="border-border/70 bg-background/50 flex items-start gap-3 rounded-lg border p-3.5">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sun className="size-4" />
            </div>
            <div>
              <p className="text-foreground text-xs font-semibold">Best Visiting Window</p>
              <p className="text-primary mt-0.5 text-xs font-medium">{advisory.bestSeason}</p>
              <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                {advisory.seasonAdvice}
              </p>
            </div>
          </div>

          {/* Security & Checkposts */}
          <div className="border-border/70 bg-background/50 flex items-start gap-3 rounded-lg border p-3.5">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileText className="size-4" />
            </div>
            <div>
              <p className="text-foreground text-xs font-semibold">Checkpost & Documentation</p>
              <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                {advisory.checkpostNotice}
              </p>
            </div>
          </div>

          {/* Money & ATM */}
          <div className="border-border/70 bg-background/50 flex items-start gap-3 rounded-lg border p-3.5">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CreditCard className="size-4" />
            </div>
            <div>
              <p className="text-foreground text-xs font-semibold">Cash & ATM Availability</p>
              <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                {advisory.cashAtmNotice}
              </p>
            </div>
          </div>

          {/* Local Terrain & Transport */}
          <div className="border-border/70 bg-background/50 flex items-start gap-3 rounded-lg border p-3.5">
            <div className="bg-primary/10 text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md">
              <Truck className="size-4" />
            </div>
            <div>
              <p className="text-foreground text-xs font-semibold">Internal Transit</p>
              <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                {advisory.localTransport}
              </p>
            </div>
          </div>
        </div>

        {/* Network Connectivity Matrix */}
        <div className="border-border/80 bg-muted/20 mt-4 rounded-lg border p-3.5">
          <div className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
            <Signal className="text-primary size-3.5" />
            <span>Mobile Network Coverage at Location</span>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="border-border/60 bg-background flex items-center justify-between rounded-md border px-2.5 py-1.5">
              <span className="text-xs font-medium">Robi / Airtel</span>
              <span
                className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${getSignalBadgeColor(advisory.networkSignal.robi)}`}
              >
                {advisory.networkSignal.robi}
              </span>
            </div>

            <div className="border-border/60 bg-background flex items-center justify-between rounded-md border px-2.5 py-1.5">
              <span className="text-xs font-medium">Teletalk</span>
              <span
                className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${getSignalBadgeColor(advisory.networkSignal.teletalk)}`}
              >
                {advisory.networkSignal.teletalk}
              </span>
            </div>

            <div className="border-border/60 bg-background flex items-center justify-between rounded-md border px-2.5 py-1.5">
              <span className="text-xs font-medium">Grameenphone</span>
              <span
                className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${getSignalBadgeColor(advisory.networkSignal.gp)}`}
              >
                {advisory.networkSignal.gp}
              </span>
            </div>

            <div className="border-border/60 bg-background flex items-center justify-between rounded-md border px-2.5 py-1.5">
              <span className="text-xs font-medium">Banglalink</span>
              <span
                className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${getSignalBadgeColor(advisory.networkSignal.bl)}`}
              >
                {advisory.networkSignal.bl}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
