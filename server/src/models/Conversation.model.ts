import { Schema, model } from 'mongoose';
import {
  COMMUNICATION_CHANNELS,
  CONVERSATION_PRIORITIES,
  CONVERSATION_STATUSES,
  CONVERSATION_TYPES,
  HANDLING_MODES,
} from '@/constants/index.js';

const participantSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['guest', 'host', 'admin', 'customer', 'staff', 'visitor'] },
    lastReadAt: Date,
  },
  { _id: false },
);

const conversationSchema = new Schema(
  {
    channel: {
      type: String,
      enum: COMMUNICATION_CHANNELS,
      default: 'website',
      index: true,
    },
    type: { type: String, enum: CONVERSATION_TYPES, default: 'support' },
    participants: {
      type: [participantSchema],
      default: [],
      validate: {
        validator: function (items: unknown[]) {
          const doc = this as {
            channel?: string;
            customerId?: unknown;
            customerPhone?: string;
            externalContactId?: string;
            customerDisplayName?: string;
          };
          if (doc.channel === 'internal') {
            return Array.isArray(items) && items.length >= 2;
          }
          return (
            (Array.isArray(items) && items.length > 0) ||
            Boolean(
              doc.customerId ||
              doc.customerPhone ||
              doc.externalContactId ||
              doc.customerDisplayName,
            )
          );
        },
        message: 'Conversation must have at least one participant or customer identifier',
      },
    },
    // Channel / Contact Identifiers
    externalContactId: { type: String, trim: true, index: true },
    externalPlatformId: { type: String, trim: true, index: true },
    customerDisplayName: { type: String, trim: true, maxlength: 120 },
    customerPhone: { type: String, trim: true, maxlength: 30, index: true },
    customerEmail: { type: String, trim: true, lowercase: true, maxlength: 120, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },

    // Assignment & Workflow
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    status: {
      type: String,
      enum: CONVERSATION_STATUSES,
      default: 'open',
      index: true,
    },
    priority: {
      type: String,
      enum: CONVERSATION_PRIORITIES,
      default: 'medium',
      index: true,
    },
    handlingMode: {
      type: String,
      enum: HANDLING_MODES,
      default: 'ai',
      index: true,
    },
    tags: [{ type: String, trim: true }],

    // Linked Tour / Booking Context
    eventId: { type: Schema.Types.ObjectId, ref: 'TourEvent', index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', index: true },

    // Metadata & Messaging State
    title: { type: String, trim: true, maxlength: 160 },
    lastMessageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    lastMessageAt: { type: Date, index: true },
    unreadCountAdmin: { type: Number, default: 0, min: 0 },
    unreadCountCustomer: { type: Number, default: 0, min: 0 },
    isClosed: { type: Boolean, default: false, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false },
);

conversationSchema.index({ channel: 1, status: 1, updatedAt: -1 });
conversationSchema.index({ 'participants.userId': 1, lastMessageAt: -1 });
conversationSchema.index({ externalContactId: 1, channel: 1 });

export const Conversation = model('Conversation', conversationSchema);
