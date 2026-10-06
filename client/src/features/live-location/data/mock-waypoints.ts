/**
 * Realistic Highway Waypoints for Bangladesh Tours
 * Route: Dhaka (Sayedabad) -> Cumilla -> Khagrachari -> Sajek Valley
 */

import type { LiveTourEvent } from '../types/location.types';

export interface RouteWaypoint {
  name: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  heading: number;
  milestoneTitle: string;
}

export const SAJEK_HIGHWAY_WAYPOINTS: RouteWaypoint[] = [
  {
    name: 'Sayedabad Central Bus Terminal, Dhaka',
    latitude: 23.7196,
    longitude: 90.4267,
    speedKmh: 0,
    heading: 110,
    milestoneTitle: 'Boarding Point: Sayedabad',
  },
  {
    name: 'Kanchpur Bridge Expressway',
    latitude: 23.7025,
    longitude: 90.5284,
    speedKmh: 58,
    heading: 125,
    milestoneTitle: 'Departed Greater Dhaka',
  },
  {
    name: 'Meghna Bridge Toll Plaza',
    latitude: 23.6062,
    longitude: 90.6277,
    speedKmh: 64,
    heading: 130,
    milestoneTitle: 'Crossing Meghna River',
  },
  {
    name: 'Daudkandi Bypass, Cumilla',
    latitude: 23.535,
    longitude: 90.718,
    speedKmh: 72,
    heading: 135,
    milestoneTitle: 'Chittagong-bound Highway',
  },
  {
    name: 'Noorjahan Highway Restaurant, Cumilla',
    latitude: 23.4607,
    longitude: 91.1809,
    speedKmh: 0,
    heading: 140,
    milestoneTitle: 'Highway Midnight Break',
  },
  {
    name: 'Feni Bypass Junction',
    latitude: 23.0186,
    longitude: 91.3966,
    speedKmh: 75,
    heading: 115,
    milestoneTitle: 'Approaching Feni Toll',
  },
  {
    name: 'Khagrachari Mountain Highway Junction',
    latitude: 23.1079,
    longitude: 91.9695,
    speedKmh: 45,
    heading: 65,
    milestoneTitle: 'Hill Tracts Breakfast Stop',
  },
  {
    name: 'Dighinala Army Checkpost',
    latitude: 23.257,
    longitude: 92.059,
    speedKmh: 35,
    heading: 50,
    milestoneTitle: 'Waiting for Army Convoy Escort',
  },
  {
    name: 'Baghaihat Forest Road',
    latitude: 23.332,
    longitude: 92.195,
    speedKmh: 30,
    heading: 45,
    milestoneTitle: 'Sajek Convoy En Route',
  },
  {
    name: 'Sajek Valley Helipad / Resort Hub',
    latitude: 23.382,
    longitude: 92.2938,
    speedKmh: 0,
    heading: 30,
    milestoneTitle: 'Final Destination Reached',
  },
];

export const MOCK_ACTIVE_TOUR_EVENTS: LiveTourEvent[] = [
  {
    id: 'evt-sajek-01',
    tourName: 'Sajek Valley Cloud Odyssey & Helipad Serenity',
    destination: 'Sajek Valley',
    hostId: 'u-host-1',
    hostName: 'Rahim Ahmed',
    hostPhone: '+880 1712-345678',
    busId: 'bus-01',
    busNumber: 'LABIB-01',
    busType: 'Hyundai Universe AC',
    guestCount: 32,
    status: 'in-progress',
    departureTime: '10:30 PM (Yesterday)',
    meetingPoint: 'Sayedabad Janapath Counter #4',
    originCoordinates: [23.7196, 90.4267],
    destinationCoordinates: [23.382, 92.2938],
  },
  {
    id: 'evt-cox-02',
    tourName: "Cox's Bazar Sea Breeze & Inani Coral Safari",
    destination: "Cox's Bazar",
    hostId: 'u-host-2',
    hostName: 'Karim Ullah',
    hostPhone: '+880 1819-987654',
    busId: 'bus-02',
    busNumber: 'LABIB-02',
    busType: 'Scania K410 Multiaxle AC',
    guestCount: 38,
    status: 'boarding',
    departureTime: '11:00 PM Tonight',
    meetingPoint: 'Arambagh Central Bus Station',
    originCoordinates: [23.7312, 90.4187],
    destinationCoordinates: [21.4272, 92.0058],
  },
];
