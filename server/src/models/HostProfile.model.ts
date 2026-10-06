import { Schema, model } from 'mongoose';

const hostProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String, trim: true, maxlength: 3000, default: '' },
    experienceYears: { type: Number, min: 0, max: 80, default: 0 },
    languages: { type: [String], default: [] },
    assignedEventIds: [{ type: Schema.Types.ObjectId, ref: 'TourEvent' }],
    emergencyContact: {
      name: { type: String, trim: true, maxlength: 120 },
      phone: { type: String, trim: true, maxlength: 24 },
      relationship: { type: String, trim: true, maxlength: 60 },
    },
    isAvailable: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false },
);

export const HostProfile = model('HostProfile', hostProfileSchema);
