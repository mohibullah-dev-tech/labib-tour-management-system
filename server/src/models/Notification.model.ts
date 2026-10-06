import { Schema, model } from 'mongoose';
import { NOTIFICATION_TYPES } from '@/constants/index.js';

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    eventId: { type: Schema.Types.ObjectId, ref: 'TourEvent', index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', index: true },
    isRead: { type: Boolean, default: false },
    readAt: Date,
    actionUrl: { type: String, trim: true, maxlength: 2048 },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false },
);

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = model('Notification', notificationSchema);
