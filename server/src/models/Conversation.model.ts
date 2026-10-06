import { Schema, model } from 'mongoose';
import { CONVERSATION_TYPES } from '@/constants/index.js';

const participantSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['guest', 'host', 'admin'], required: true },
    lastReadAt: Date,
  },
  { _id: false },
);

const conversationSchema = new Schema(
  {
    type: { type: String, enum: CONVERSATION_TYPES, required: true, default: 'guest_host' },
    participants: {
      type: [participantSchema],
      required: true,
      validate: (items: unknown[]) => items.length >= 2,
    },
    eventId: { type: Schema.Types.ObjectId, ref: 'TourEvent', index: true },
    title: { type: String, trim: true, maxlength: 160 },
    lastMessageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    lastMessageAt: { type: Date, index: true },
    isClosed: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, versionKey: false },
);

conversationSchema.index({ 'participants.userId': 1, lastMessageAt: -1 });

export const Conversation = model('Conversation', conversationSchema);
