import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
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
 * Navigates to the Tours listing with the chosen destination pre-filled
 * as a search term (`/tours?search=<name>`), which ToursPage reads on
 * mount and hands to useTourFilters' initial state. Destination names
 * here intentionally aren't matched against the Tours module's exact
 * `destination` filter values — the two catalogs (8 broad Home
 * destinations vs. 11 specific tour products) don't line up 1:1 (e.g.
 * "Sreemangal" only exists combined with Sylhet as a tour product) — a
 * free-text search match against tour name/destination is the more
 * forgiving, always-correct bridge between them.
 * Date and guest count aren't sent yet — they're booking-flow inputs,
 * not tour-search filters, and will be used once Booking is built.
 */
function SearchTourWidget() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const selected = DESTINATIONS.find((d) => d.id === destination);
    const params = new URLSearchParams();
    if (selected) params.set('search', selected.name);
    navigate(`/tours${params.toString() ? `?${params.toString()}` : ''}`);
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
