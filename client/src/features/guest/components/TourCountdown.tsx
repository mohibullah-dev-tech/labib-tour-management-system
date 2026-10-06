import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TourCountdownProps {
  targetDate: string; // ISO date
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeRemaining(targetIso: string): TimeRemaining {
  const difference = new Date(targetIso).getTime() - new Date().getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isExpired: false,
  };
}

export function TourCountdown({ targetDate, className }: TourCountdownProps) {
  const [time, setTime] = useState<TimeRemaining>(() => calculateTimeRemaining(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(calculateTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (time.isExpired) {
    return (
      <div
        className={`bg-primary/10 text-primary flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${className || ''}`}
      >
        <Clock className="size-4 animate-spin" />
        <span>Tour is ongoing or departed</span>
      </div>
    );
  }

  const units = [
    { label: 'Days', value: time.days },
    { label: 'Hours', value: time.hours },
    { label: 'Mins', value: time.minutes },
    { label: 'Secs', value: time.seconds },
  ];

  return (
    <div className={`flex flex-col gap-2 ${className || ''}`}>
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wider uppercase">
        <Clock className="text-primary size-3.5" />
        <span>Countdown to Departure</span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="border-border/80 bg-card/60 flex flex-col items-center justify-center rounded-lg border p-2 shadow-xs backdrop-blur sm:p-2.5"
          >
            <span className="text-foreground font-mono text-xl font-bold tracking-tight sm:text-2xl">
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="text-muted-foreground text-[10px] font-medium uppercase sm:text-xs">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
