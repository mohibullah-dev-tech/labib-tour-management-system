import { Schema, model } from 'mongoose';
import { SEAT_STATUSES } from '@/constants/index.js';

const eventSeatSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'TourEvent', required: true },
    busId: { type: Schema.Types.ObjectId, ref: 'Bus', required: true },
    seatNumber: { type: String, required: true, match: /^(?:[A-J][1-4]|K[1-5])$/ },
    status: { type: String, enum: SEAT_STATUSES, required: true, default: 'available' },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', default: null },
    lockedUntil: Date,
  },
  { timestamps: true, versionKey: false },
);

eventSeatSchema.index({ eventId: 1, seatNumber: 1 }, { unique: true });
eventSeatSchema.index({ eventId: 1, status: 1 });
eventSeatSchema.index({ eventId: 1, status: 1, lockedUntil: 1 });

export const EventSeat = model('EventSeat', eventSeatSchema);
