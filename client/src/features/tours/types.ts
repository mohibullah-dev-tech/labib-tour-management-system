/**
 * Tour data model — shaped to match what the future Tours API will
 * return. Every section on the Tour Details page reads one slice of
 * this type; optional fields are optional because real tours won't all
 * have every section populated (a Day Tour has no Hotel, for instance),
 * and every component below is written to render conditionally rather
 * than assume a field exists.
 */

export type TourCategory = 'relax' | 'premium' | 'day' | 'seasonal';

export const TOUR_CATEGORY_LABELS: Record<TourCategory, string> = {
  relax: 'Relax Tours',
  premium: 'Premium Tours',
  day: 'Day Tours',
  seasonal: 'Seasonal Tours',
};

export type PackageTier = 'single' | 'couple' | 'premium';

export interface TourPackage {
  id: string;
  tier: PackageTier;
  name: string;
  priceBDT: number;
  description: string;
  inclusions: string[];
}

export interface RouteStop {
  id: string;
  order: number;
  location: string;
  description?: string;
  /** Optional — populated once the Route Map is wired to a real map provider. */
  lat?: number;
  lng?: number;
}

export interface FoodMenuEntry {
  meal: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
  items: string[];
}

export interface PlaceToVisit {
  id: string;
  name: string;
  image: string;
  description: string;
}

export interface HotelInfo {
  name: string;
  image: string;
  description: string;
  rating: number;
}

export interface HostInfo {
  name: string;
  photo: string;
  experienceYears: number;
  phone: string;
  whatsapp: string;
  bio: string;
}

export interface TourReview {
  id: string;
  name: string;
  avatarSeed: string;
  rating: number;
  travelDate: string; // ISO date
  comment: string;
}

export interface TourFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface Tour {
  id: string;
  slug: string;
  name: string;
  category: TourCategory;
  destination: string;
  region: string;
  coverImage: string;
  /** Full gallery, coverImage is typically gallery[0] as well. */
  gallery: string[];
  shortDescription: string;
  longDescription: string;
  startingPriceBDT: number;
  durationDays: number;
  durationNights: number;
  nextDepartureDate: string; // ISO date
  availableSeats: number;
  totalSeats: number;
  busType: string;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;

  // Detail-page sections — optional; not every tour has every section
  // populated yet (see note above).
  packages?: TourPackage[];
  includes?: string[];
  excludes?: string[];
  foodMenu?: FoodMenuEntry[];
  route?: RouteStop[];
  placesToVisit?: PlaceToVisit[];
  hotel?: HotelInfo;
  host?: HostInfo;
  reviews?: TourReview[];
  faq?: TourFaqItem[];
  relatedTourIds?: string[];
}
