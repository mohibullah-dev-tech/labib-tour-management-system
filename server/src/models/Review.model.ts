import { Schema, model } from 'mongoose';
import { REVIEW_STATUSES } from '@/constants/index.js';

const reviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'TourEvent', required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 120 },
    comment: { type: String, trim: true, maxlength: 3000, default: '' },
    images: { type: [String], default: [] },
    status: { type: String, enum: REVIEW_STATUSES, default: 'pending', index: true },
  },
  { timestamps: true, versionKey: false },
);

reviewSchema.index({ bookingId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ eventId: 1, status: 1, createdAt: -1 });

export const Review = model('Review', reviewSchema);
