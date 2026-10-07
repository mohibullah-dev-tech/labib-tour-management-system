import { Schema, model } from 'mongoose';
import { USER_ROLES } from '@/constants/index.js';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    phone: { type: String, trim: true, maxlength: 24, sparse: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, required: true, default: 'guest', index: true },
    avatar: { type: String, trim: true, maxlength: 2048 },
    isActive: { type: Boolean, default: true, index: true },
    isVerified: { type: Boolean, default: false },
    lastLoginAt: Date,
    refreshTokenHash: { type: String, select: false },
    refreshTokenExpiresAt: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpiresAt: { type: Date, select: false },
  },
  { timestamps: true, versionKey: false },
);

userSchema.index({ role: 1, isActive: 1 });

export const User = model('User', userSchema);
