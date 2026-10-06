import { Schema, model } from 'mongoose';
import { LIVE_LOCATION_STATUSES } from '@/constants/index.js';

const liveLocationSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'TourEvent', required: true, unique: true },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    busId: { type: Schema.Types.ObjectId, ref: 'Bus', required: true },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    accuracy: { type: Number, min: 0 },
    headingDegrees: { type: Number, min: 0, max: 360 },
    speed: { type: Number, min: 0 },
    status: {
      type: String,
      enum: LIVE_LOCATION_STATUSES,
      required: true,
      default: 'inactive',
      index: true,
    },
    timestamp: { type: Date, required: true, index: true },
  },
  { timestamps: true, versionKey: false },
);

export const LiveLocation = model('LiveLocation', liveLocationSchema);
