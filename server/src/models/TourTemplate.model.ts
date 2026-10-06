import { Schema, model } from 'mongoose';
import { DEFAULT_MINIMUM_ADVANCE_PERCENT, PACKAGE_TIERS, TOUR_TYPES } from '@/constants/index.js';

const itinerarySchema = new Schema(
  {
    day: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    startTime: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    endTime: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    locations: { type: [String], default: [] },
    images: { type: [String], default: [] },
  },
  { _id: false },
);

const pricingSchema = new Schema(
  {
    basePrice: { type: Number, required: true, min: 0 },
    packagePrices: { type: Map, of: { type: Number, min: 0 }, default: () => new Map() },
  },
  { _id: false },
);

const tourTemplateSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, trim: true, maxlength: 300, default: '' },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    tourType: { type: String, enum: TOUR_TYPES, required: true, index: true },
    destination: { type: String, required: true, trim: true, maxlength: 160, index: true },
    durationDays: { type: Number, required: true, min: 1, max: 60 },
    featuredImage: { type: String, trim: true, maxlength: 2048 },
    gallery: { type: [String], default: [] },
    highlights: { type: [String], default: [] },
    inclusions: { type: [String], default: [] },
    exclusions: { type: [String], default: [] },
    itinerary: { type: [itinerarySchema], default: [] },
    images: { type: [String], default: [] },
    pricing: { type: pricingSchema, required: true },
    minimumAdvancePercent: {
      type: Number,
      min: 0,
      max: 100,
      default: DEFAULT_MINIMUM_ADVANCE_PERCENT,
    },
    packageTiers: { type: [String], enum: PACKAGE_TIERS, default: ['single'] },
    isSeasonal: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, versionKey: false },
);

tourTemplateSchema.index({ isPublished: 1, tourType: 1, destination: 1 });

export const TourTemplate = model('TourTemplate', tourTemplateSchema);
