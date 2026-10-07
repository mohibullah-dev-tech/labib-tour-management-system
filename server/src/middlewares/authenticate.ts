import jwt from 'jsonwebtoken';
import type { RequestHandler } from 'express';
import { User } from '@/models/index.js';
import { ApiError } from '@/utils/ApiError.js';
import { env } from '@/config/env.js';
import { asyncHandler } from '@/utils/asyncHandler.js';
import type { UserRole } from '@/constants/index.js';

interface AccessClaims extends jwt.JwtPayload {
  sub: string;
  tokenUse: 'access';
}

export const authenticate: RequestHandler = asyncHandler(async (req, _res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) throw ApiError.unauthorized('Authentication required');
  const token = authorization.slice('Bearer '.length);
  let claims: AccessClaims;
  try {
    claims = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: 'ltms-api',
      audience: 'ltms-client',
    }) as AccessClaims;
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token');
  }
  if (claims.tokenUse !== 'access' || !claims.sub)
    throw ApiError.unauthorized('Invalid access token');
  const user = await User.findById(claims.sub).select('name email role isActive').lean();
  if (!user || !user.isActive) throw ApiError.unauthorized('Account is unavailable');
  req.user = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
  };
  next();
});

export function authorize(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized('Authentication required'));
    if (!roles.includes(req.user.role))
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    next();
  };
}
