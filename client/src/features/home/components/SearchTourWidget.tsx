import { useState, type FormEvent } from 'react';
import { MapPin, CalendarDays, Users, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DESTINATIONS } from '@/features/home/data/destinations';

/**
 * UI only — no search/booking API exists yet. Holds its own local form
 * state so the controls feel real (typing, selecting), but submission is
 * a no-op placeholder. Swap `handleSubmit` for a real query/navigation
 * (e.g. `navigate(`/tours?destination=...`)`) once the Tours search
 * feature is built — the form contract (values collected here) won't
 * need to change.
 */
function SearchTourWidget() {
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Placeholder — Tours search is a future feature.
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Search tours"
      className="border-border bg-card/95 shadow-floating laptop:grid-cols-[1.3fr_1fr_0.8fr_auto] laptop:items-end laptop:gap-3 laptop:p-5 grid w-full grid-cols-1 gap-3 rounded-xl border p-4 backdrop-blur"
    >
      <div className="flex flex-col gap-1.5 text-left">
        <Label htmlFor="search-destination" className="flex items-center gap-1.5 text-xs">
          <MapPin className="text-primary size-3.5" aria-hidden="true" />
          Destination
        </Label>
        <Select value={destination} onValueChange={setDestination}>
          <SelectTrigger id="search-destination">
            <SelectValue placeholder="Where do you want to go?" />
          </SelectTrigger>
          <SelectContent>
            {DESTINATIONS.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5 text-left">
        <Label htmlFor="search-date" className="flex items-center gap-1.5 text-xs">
          <CalendarDays className="text-primary size-3.5" aria-hidden="true" />
          Travel Date
        </Label>
        <Input
          id="search-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5 text-left">
        <Label htmlFor="search-guests" className="flex items-center gap-1.5 text-xs">
          <Users className="text-primary size-3.5" aria-hidden="true" />
          Guests
        </Label>
        <Input
          id="search-guests"
          type="number"
          min={1}
          placeholder="2"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
        />
      </div>

      <Button type="submit" size="lg" className="gap-2">
        <Search className="size-4" />
        Search
      </Button>
    </form>
  );
}

export { SearchTourWidget };
