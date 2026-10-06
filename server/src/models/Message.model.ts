import { Schema, model } from 'mongoose';
import { MESSAGE_STATUSES } from '@/constants/index.js';

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
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, trim: true, maxlength: 5000, default: '' },
    attachments: { type: [attachmentSchema], default: [] },
    status: { type: String, enum: MESSAGE_STATUSES, default: 'sent' },
    deliveredAt: Date,
    readAt: Date,
  },
  { timestamps: true, versionKey: false },
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.pre('validate', function validateContent() {
  if (!this.content.trim() && this.attachments.length === 0)
    this.invalidate('content', 'Message requires text or an attachment reference');
});

export const Message = model('Message', messageSchema);
