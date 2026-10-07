import { createHash, randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/models/index.js';
import { env } from '@/config/env.js';
import { ApiError } from '@/utils/ApiError.js';
import type { LoginInput, RegisterInput } from '@/validators/auth.validators.js';

const REFRESH_TOKEN_TTL_MS = durationToMilliseconds(env.JWT_REFRESH_EXPIRES_IN);
const PASSWORD_HASH_COST = 12;

function durationToMilliseconds(value: string): number {
  const match = value.match(/^(\d+)(s|m|h|d)$/);
  if (!match) throw new Error('JWT expiration must use s, m, h, or d units');
  const amount = Number(match[1]);
  const multiplier = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[
    match[2] as 's' | 'm' | 'h' | 'd'
  ];
  return amount * multiplier;
}

function digest(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function createTokenPair(userId: string) {
  const accessToken = jwt.sign({ tokenUse: 'access' }, env.JWT_ACCESS_SECRET, {
    subject: userId,
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    issuer: 'ltms-api',
    audience: 'ltms-client',
  });
  const refreshToken = jwt.sign(
    { tokenUse: 'refresh', nonce: randomUUID() },
    env.JWT_REFRESH_SECRET,
    {
      subject: userId,
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      issuer: 'ltms-api',
      audience: 'ltms-client',
    },
  );
  return {
    accessToken,
    refreshToken,
    refreshTokenHash: digest(refreshToken),
    refreshTokenExpiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    expiresIn: durationToMilliseconds(env.JWT_ACCESS_EXPIRES_IN) / 1000,
  };
}

export function toPublicUser(user: {
  _id: unknown;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  avatar?: string | null;
  isVerified: boolean;
  createdAt: Date;
}) {
  return {
    id: String(user._id),
    fullName: user.name,
    email: user.email,
    phone: user.phone ?? '',
    role: user.role,
    avatarUrl: user.avatar,
    isEmailVerified: user.isVerified,
    createdAt: user.createdAt.toISOString(),
  };
}

async function saveRefreshToken(userId: string) {
  const tokens = createTokenPair(userId);
  await User.updateOne(
    { _id: userId, isActive: true },
    {
      $set: {
        refreshTokenHash: tokens.refreshTokenHash,
        refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
      },
    },
  );
  return tokens;
}

export const authService = {
  async register(input: RegisterInput) {
    const passwordHash = await bcrypt.hash(input.password, PASSWORD_HASH_COST);
    const user = await User.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: 'guest',
    });
    const tokens = await saveRefreshToken(user._id.toString());
    return {
      user: toPublicUser(user),
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
      refreshToken: tokens.refreshToken,
    };
  },

  async login(input: LoginInput) {
    const identifier = input.identifier.trim();
    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
    })
      .select('+passwordHash')
      .exec();
    if (!user || !user.isActive || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw ApiError.unauthorized('Invalid email/phone or password');
    }
    user.lastLoginAt = new Date();
    await user.save();
    const tokens = await saveRefreshToken(user._id.toString());
    return {
      user: toPublicUser(user),
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
      refreshToken: tokens.refreshToken,
    };
  },

  async refresh(refreshToken: string) {
    let claims: jwt.JwtPayload;
    try {
      claims = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET, {
        issuer: 'ltms-api',
        audience: 'ltms-client',
      }) as jwt.JwtPayload;
    } catch {
      throw ApiError.unauthorized('Refresh session expired; log in again');
    }
    if (claims.tokenUse !== 'refresh' || !claims.sub)
      throw ApiError.unauthorized('Invalid refresh session');
    const oldHash = digest(refreshToken);
    const user = await User.findOne({
      _id: claims.sub,
      isActive: true,
      refreshTokenHash: oldHash,
      refreshTokenExpiresAt: { $gt: new Date() },
    })
      .select('+refreshTokenHash +refreshTokenExpiresAt')
      .exec();
    if (!user) throw ApiError.unauthorized('Refresh session expired; log in again');

    const tokens = createTokenPair(user._id.toString());
    const rotated = await User.findOneAndUpdate(
      {
        _id: user._id,
        refreshTokenHash: oldHash,
        refreshTokenExpiresAt: { $gt: new Date() },
        isActive: true,
      },
      {
        $set: {
          refreshTokenHash: tokens.refreshTokenHash,
          refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
        },
      },
      { new: true },
    ).exec();
    if (!rotated) throw ApiError.unauthorized('Refresh session has already been used');
    return {
      user: toPublicUser(rotated),
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
      refreshToken: tokens.refreshToken,
    };
  },

  async logout(refreshToken?: string) {
    if (!refreshToken) return;
    try {
      const claims = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET, {
        issuer: 'ltms-api',
        audience: 'ltms-client',
      }) as jwt.JwtPayload;
      if (claims.tokenUse === 'refresh' && claims.sub) {
        await User.updateOne(
          { _id: claims.sub, refreshTokenHash: digest(refreshToken) },
          {
            $unset: { refreshTokenHash: 1, refreshTokenExpiresAt: 1 },
          },
        );
      }
    } catch {
      // Logout always clears the browser cookie even if the presented token is invalid.
    }
  },

  async getCurrentUser(userId: string) {
    const user = await User.findOne({ _id: userId, isActive: true }).exec();
    if (!user) throw ApiError.notFound('User not found');
    return toPublicUser(user);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId).select('+passwordHash').exec();
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw ApiError.badRequest('Current password is incorrect');
    }
    user.passwordHash = await bcrypt.hash(newPassword, PASSWORD_HASH_COST);
    await user.save();
    await User.updateOne(
      { _id: userId },
      { $unset: { refreshTokenHash: 1, refreshTokenExpiresAt: 1 } },
    );
  },

  async forgotPassword() {
    // No email provider is configured in this phase; do not claim that a message was sent.
    throw new ApiError(
      501,
      'Password recovery is not configured; no email was sent',
      true,
      undefined,
      'EMAIL_NOT_CONFIGURED',
    );
  },
};
