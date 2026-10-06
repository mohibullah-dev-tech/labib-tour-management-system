import { Schema, model } from 'mongoose';
import { BOOKING_PAYMENT_STATUSES, BOOKING_STATUSES, BOOKING_TYPES } from '@/constants/index.js';

const guestSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 24 },
    email: { type: String, trim: true, lowercase: true, maxlength: 254 },
    address: { type: String, trim: true, maxlength: 500 },
    emergencyContact: { type: String, trim: true, maxlength: 24 },
    emergencyContactName: { type: String, trim: true, maxlength: 120 },
    age: { type: Number, min: 0, max: 120 },
  },
  { _id: false },
);

const bookingSchema = new Schema(
  {
    bookingCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'TourEvent', required: true, index: true },
    tourTemplateId: { type: Schema.Types.ObjectId, ref: 'TourTemplate', required: true },
    bookingType: { type: String, enum: BOOKING_TYPES, required: true },
    seatNumbers: { type: [String], required: true },
    personCount: { type: Number, required: true, min: 1, max: 10 },
    guestDetails: { type: [guestSchema], required: true },
    packagePrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, min: 0, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    minimumAdvancePercent: { type: Number, required: true, min: 0, max: 100 },
    minimumAdvance: { type: Number, required: true, min: 0 },
    receivedAmount: { type: Number, required: true, min: 0, default: 0 },
    dueAmount: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: BOOKING_PAYMENT_STATUSES, default: 'unpaid', index: true },
    bookingStatus: {
      type: String,
      enum: BOOKING_STATUSES,
      required: true,
      default: 'pending',
      index: true,
    },
    pickupPoint: { type: String, trim: true, maxlength: 200 },
    specialNotes: { type: String, trim: true, maxlength: 1000 },
    currency: { type: String, uppercase: true, default: 'BDT' },
  },
  { timestamps: true, versionKey: false },
);

bookingSchema.index({ customerId: 1, createdAt: -1 });
bookingSchema.index({ eventId: 1, bookingStatus: 1 });
bookingSchema.pre('validate', function validateTotals() {
  if (this.seatNumbers.length !== this.personCount)
    this.invalidate('seatNumbers', 'Must have one seat per guest');
  if (this.guestDetails.length !== this.personCount)
    this.invalidate('guestDetails', 'Must have one guest per booking seat');
  const minimum = Math.ceil((this.totalAmount * this.minimumAdvancePercent) / 100);
  if (this.minimumAdvance < minimum)
    this.invalidate('minimumAdvance', 'Minimum advance must match the saved percentage');
  if (this.dueAmount !== Math.max(0, this.totalAmount - this.receivedAmount)) {
    this.invalidate('dueAmount', 'Due amount must match total less received');
  }
  if (this.paymentStatus === 'paid' && this.dueAmount > 0)
    this.invalidate('paymentStatus', 'Paid bookings cannot have an outstanding balance');
});

export const Booking = model('Booking', bookingSchema);
