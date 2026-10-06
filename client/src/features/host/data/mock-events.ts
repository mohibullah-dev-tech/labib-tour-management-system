import type { AssignedEvent } from '@/features/host/types';
import { MOCK_TOUR_TIMELINE } from './mock-timeline';

const today = new Date();
const formattedToday = today.toISOString().split('T')[0];

const in14Days = new Date(today);
in14Days.setDate(today.getDate() + 14);

const in28Days = new Date(today);
in28Days.setDate(today.getDate() + 28);

export const MOCK_ASSIGNED_EVENTS: AssignedEvent[] = [
  {
    id: 'EVT-SAJEK-0806',
    tourId: 'tour-sajek-relax',
    tourName: 'Sajek Valley Cloud Odyssey & Helipad Serenity',
    destination: 'Sajek Valley',
    coverImage:
      'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80',
    departureDate: `${formattedToday}T16:00:00.000Z`,
    returnDate: new Date(today.getTime() + 3 * 86400000).toISOString(),
    departureTime: '10:00 PM',
    departureLocation: 'Sayedabad Bus Terminal, Dhaka',
    duration: '3 Days / 2 Nights',
    bus: {
      busNumber: 'LABIB-01',
      name: 'Labib Royal Star Liner',
      acType: 'AC',
      driverName: 'Md. Mostofa Kamal',
      driverPhone: '+880 1711-224466',
      helperName: 'Shahidul Islam',
      helperPhone: '+880 1822-335577',
      totalSeats: 45,
      bookedSeats: 32,
      availableSeats: 13,
    },
    hostId: 'u-host-1',
    hostName: 'Rahim Ahmed',
    hostPhone: '+880 1711-000010',
    guestCount: 32,
    status: 'boarding',
    isToday: true,
    meetingPoint: 'Labib Tour Lounge, Counter 4, Sayedabad Inter-District Bus Terminal',
    reportingTime: '09:15 PM',
    emergencyContact: '+880 1700-000000 (LTMS Central Dispatch)',
    notes:
      'Khagrachari army convoy leaves strictly at 10:30 AM tomorrow. Keep all guest National ID cards or birth certificates handy at the Baghaihat check-post.',
    timeline: MOCK_TOUR_TIMELINE,
  },
  {
    id: 'EVT-COXB-0820',
    tourId: 'tour-coxsbazar-premier',
    tourName: "Cox's Bazar & Inani Marine Drive Luxury Gateway",
    destination: "Cox's Bazar",
    coverImage:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    departureDate: in14Days.toISOString(),
    returnDate: new Date(in14Days.getTime() + 4 * 86400000).toISOString(),
    departureTime: '11:00 PM',
    departureLocation: 'Arambagh Bus Terminal, Dhaka',
    duration: '4 Days / 3 Nights',
    bus: {
      busNumber: 'LABIB-02',
      name: 'Labib Platinum Coach',
      acType: 'AC',
      driverName: 'Rafiqul Islam',
      driverPhone: '+880 1712-446688',
      helperName: 'Alamgir Hossain',
      helperPhone: '+880 1823-557799',
      totalSeats: 45,
      bookedSeats: 28,
      availableSeats: 17,
    },
    hostId: 'u-host-1',
    hostName: 'Rahim Ahmed',
    hostPhone: '+880 1711-000010',
    guestCount: 28,
    status: 'scheduled',
    isToday: false,
    meetingPoint: 'Arambagh Labib Travel Pavilion, Dhaka',
    reportingTime: '10:15 PM',
    emergencyContact: '+880 1700-000000 (LTMS Central Dispatch)',
    notes: 'Hotel Sea Pearl luxury suites pre-booked. Sunset catamaran cruise scheduled for Day 2.',
    timeline: [
      {
        id: 'cb-1',
        time: '11:00 PM',
        title: 'Arambagh Departure',
        location: 'Dhaka',
        description: 'Night journey along Chittagong expressway.',
        status: 'upcoming',
      },
      {
        id: 'cb-2',
        time: '08:00 AM',
        title: 'Arrival at Kolatoli Beach',
        location: "Cox's Bazar",
        description: 'Hotel check-in and breakfast buffet.',
        status: 'upcoming',
      },
    ],
  },
  {
    id: 'EVT-SREE-0905',
    tourId: 'tour-sreemangal-tea',
    tourName: 'Sreemangal Tea Capital & Lawachara Rainforest Trek',
    destination: 'Sreemangal',
    coverImage:
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    departureDate: in28Days.toISOString(),
    returnDate: new Date(in28Days.getTime() + 2 * 86400000).toISOString(),
    departureTime: '06:30 AM',
    departureLocation: 'Kallayanpur Bus Terminal, Dhaka',
    duration: '2 Days / 1 Night',
    bus: {
      busNumber: 'LABIB-03',
      name: 'Labib Green Valley Express',
      acType: 'AC',
      driverName: 'Nazrul Islam',
      driverPhone: '+880 1714-998877',
      helperName: 'Bablu Mia',
      helperPhone: '+880 1819-223344',
      totalSeats: 45,
      bookedSeats: 18,
      availableSeats: 27,
    },
    hostId: 'u-host-1',
    hostName: 'Rahim Ahmed',
    hostPhone: '+880 1711-000010',
    guestCount: 18,
    status: 'scheduled',
    isToday: false,
    meetingPoint: 'Kallayanpur Counter 2, Dhaka',
    reportingTime: '06:00 AM',
    emergencyContact: '+880 1700-000000 (LTMS Central Dispatch)',
    notes: 'Rain forest trek requires light hiking shoes and leech protection socks.',
    timeline: [
      {
        id: 'sr-1',
        time: '06:30 AM',
        title: 'Morning Departure',
        location: 'Dhaka',
        description: 'Scenic drive via Sylhet bypass.',
        status: 'upcoming',
      },
    ],
  },
];
