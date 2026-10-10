import { Schema, model } from 'mongoose';
import { COMMUNICATION_CHANNELS, MESSAGE_STATUSES, SENDER_TYPES } from '@/constants/index.js';

const attachmentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 255 },
    url: { type: String, required: true, trim: true, maxlength: 2048 },
    mimeType: { type: String, required: true, trim: true, maxlength: 120 },
    sizeBytes: { type: Number, min: 0, max: 25_000_000 },
  },
  { _id: false },
);

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    channel: {
      type: String,
      enum: COMMUNICATION_CHANNELS,
      default: 'website',
      index: true,
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      default: 'inbound',
      index: true,
    },
    senderType: {
      type: String,
      enum: SENDER_TYPES,
      default: 'customer',
      index: true,
    },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    senderName: { type: String, trim: true, maxlength: 120 },
    providerMessageId: { type: String, trim: true, index: true, sparse: true },
    idempotencyKey: { type: String, trim: true, index: true, sparse: true },
    content: { type: String, trim: true, maxlength: 5000, default: '' },
    attachments: { type: [attachmentSchema], default: [] },
    status: { type: String, enum: MESSAGE_STATUSES, default: 'sent', index: true },
    deliveryError: { type: String, trim: true, maxlength: 500 },
    deliveredAt: Date,
    readAt: Date,
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false },
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ providerMessageId: 1, channel: 1 }, { sparse: true });
messageSchema.pre('validate', function validateContent() {
  if (!this.content.trim() && this.attachments.length === 0)
    this.invalidate('content', 'Message requires text or an attachment reference');
});

export const Message = model('Message', messageSchema);
