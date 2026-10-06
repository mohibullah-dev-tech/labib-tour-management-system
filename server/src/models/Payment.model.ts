import { Schema, model } from 'mongoose';
import { PAYMENT_METHODS, PAYMENT_STATUSES } from '@/constants/index.js';

const paymentSchema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: PAYMENT_METHODS, required: true, default: 'other' },
    transactionId: { type: String, trim: true, maxlength: 160 },
    receivedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    note: { type: String, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      required: true,
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true, versionKey: false },
);

paymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });

export const Payment = model('Payment', paymentSchema);
