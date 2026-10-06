import type { InferSchemaType } from 'mongoose';
import type {
  Booking,
  Bus,
  Conversation,
  EventAnnouncement,
  EventSeat,
  HostProfile,
  LiveLocation,
  Message,
  Notification,
  Payment,
  Review,
  TourEvent,
  TourTemplate,
  User,
} from '@/models/index.js';
import type { MongoRepository } from '@/repositories/MongoRepository.js';

/** Repository-backed service contracts for feature modules and future controllers. */
export type UserService = MongoRepository<InferSchemaType<typeof User.schema>>;
export type HostService = MongoRepository<InferSchemaType<typeof HostProfile.schema>>;
export type TourService = MongoRepository<InferSchemaType<typeof TourTemplate.schema>>;
export type TourEventService = MongoRepository<InferSchemaType<typeof TourEvent.schema>>;
export type BusService = MongoRepository<InferSchemaType<typeof Bus.schema>>;
export type SeatService = MongoRepository<InferSchemaType<typeof EventSeat.schema>>;
export type BookingService = MongoRepository<InferSchemaType<typeof Booking.schema>>;
export type PaymentService = MongoRepository<InferSchemaType<typeof Payment.schema>>;
export type NotificationService = MongoRepository<InferSchemaType<typeof Notification.schema>>;
export type ConversationService = MongoRepository<InferSchemaType<typeof Conversation.schema>>;
export type MessageService = MongoRepository<InferSchemaType<typeof Message.schema>>;
export type ReviewService = MongoRepository<InferSchemaType<typeof Review.schema>>;
export type EventAnnouncementService = MongoRepository<
  InferSchemaType<typeof EventAnnouncement.schema>
>;
export type LiveLocationService = MongoRepository<InferSchemaType<typeof LiveLocation.schema>>;
