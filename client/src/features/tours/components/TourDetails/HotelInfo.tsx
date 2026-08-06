import type { HotelInfo as HotelInfoType } from '@/features/tours/types';
import { LazyImage } from '@/components/common/LazyImage';
import { Rating } from '@/components/common/Rating';

export interface HotelInfoProps {
  hotel?: HotelInfoType;
}

function HotelInfo({ hotel }: HotelInfoProps) {
  if (!hotel) return null;

  return (
    <div className="border-border bg-card grid grid-cols-1 gap-5 overflow-hidden rounded-lg border sm:grid-cols-[240px_1fr]">
      <LazyImage
        src={hotel.image}
        alt={hotel.name}
        aspectClassName="aspect-[4/3] sm:aspect-auto sm:h-full"
      />
      <div className="flex flex-col gap-2 p-5">
        <h4 className="font-display text-foreground text-base font-semibold">{hotel.name}</h4>
        <Rating value={hotel.rating} showValue />
        <p className="text-muted-foreground text-sm leading-relaxed">{hotel.description}</p>
      </div>
    </div>
  );
}

export { HotelInfo };
