import { Schema, model } from 'mongoose';
import { createStandardPassengerSeatLayout } from '@/constants/index.js';

const seatLayoutItemSchema = new Schema(
  {
    seatNumber: { type: String, required: true, match: /^(?:[A-J][1-4]|K[1-5])$/ },
    row: { type: String, required: true, match: /^[A-K]$/ },
    position: { type: Number, required: true, min: 1, max: 5 },
    blocksAisle: { type: Boolean, default: false },
  },
  { _id: false },
);

const busSchema = new Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 32,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    type: { type: String, enum: ['minibus', 'coach', 'sleeper'], default: 'coach' },
    isAC: { type: Boolean, default: true },
    totalSeats: { type: Number, required: true, default: 45, min: 1, max: 100 },
    layout: { type: [seatLayoutItemSchema], default: createStandardPassengerSeatLayout },
    driverSeat: { type: Boolean, default: true },
    helperSeat: { type: Boolean, default: true },
    driver: { type: String, trim: true, maxlength: 120 },
    helper: { type: String, trim: true, maxlength: 120 },
    door: { type: String, trim: true, maxlength: 60, default: 'front-right' },
    doorPosition: { type: String, default: 'front-right' },
    isActive: { type: Boolean, default: true, index: true },
    lastScheduleChangeAt: Date,
  },
  { timestamps: true, versionKey: false },
);

busSchema.pre('validate', function validateSeatLayout() {
  if (this.layout.length !== this.totalSeats) {
    this.invalidate('layout', `Seat layout must contain exactly ${this.totalSeats} seats`);
  }
  const numbers = this.layout.map((seat) => seat.seatNumber);
  if (new Set(numbers).size !== numbers.length)
    this.invalidate('layout', 'Seat numbers must be unique');
  if (this.totalSeats === 45 && !numbers.includes('K3'))
    this.invalidate('layout', 'The K3 seat must be present');
});

export const Bus = model('Bus', busSchema);
