import { Schema, model } from 'mongoose';

const eventAnnouncementSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'TourEvent', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

eventAnnouncementSchema.index({ eventId: 1, createdAt: -1 });

export const EventAnnouncement = model('EventAnnouncement', eventAnnouncementSchema);
