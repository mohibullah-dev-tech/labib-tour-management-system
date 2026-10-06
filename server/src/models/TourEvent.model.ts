import { Schema, model } from 'mongoose';
import { EVENT_STATUSES } from '@/constants/index.js';

const pickupPointSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    address: { type: String, required: true, trim: true, maxlength: 300 },
    time: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  },
  { _id: false },
);

const tourEventSchema = new Schema(
  {
    tourTemplateId: {
      type: Schema.Types.ObjectId,
      ref: 'TourTemplate',
      required: true,
      index: true,
    },
    busId: { type: Schema.Types.ObjectId, ref: 'Bus', required: true, index: true },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    eventCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true },
    capacity: { type: Number, min: 1, max: 100, default: 45 },
    bookingOpenAt: Date,
    bookingCloseAt: Date,
    status: { type: String, enum: EVENT_STATUSES, required: true, default: 'draft', index: true },
    pickupPoints: {
      type: [pickupPointSchema],
      required: true,
      validate: (points: unknown[]) => points.length > 0,
    },
    specialInstructions: { type: String, trim: true, maxlength: 3000, default: '' },
    currency: { type: String, uppercase: true, default: 'BDT', minlength: 3, maxlength: 3 },
  },
  { timestamps: true, versionKey: false },
);

tourEventSchema.index({ status: 1, startDate: 1 });
tourEventSchema.index({ busId: 1, startDate: 1, endDate: 1 });
tourEventSchema.pre('validate', function validateDates() {
  if (this.endDate <= this.startDate)
    this.invalidate('endDate', 'Event end must be after its start');
});

export const TourEvent = model('TourEvent', tourEventSchema);
