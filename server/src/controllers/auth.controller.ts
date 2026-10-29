import type { Request, Response } from 'express';
import { env } from '@/config/env.js';
import { authService } from '@/modules/auth/auth.service.js';
import { ApiError } from '@/utils/ApiError.js';
import {
  changePasswordSchema,
  googleLoginSchema,
  identifierSchema,
  loginSchema,
  registerSchema,
} from '@/validators/auth.validators.js';

const REFRESH_COOKIE_NAME = 'ltms_refresh';
const COOKIE_PATH = '/api';

function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
    path: COOKIE_PATH,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions());
}

function clearRefreshCookie(res: Response) {
  const options = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: cookieOptions().sameSite,
    path: COOKIE_PATH,
  };
  res.clearCookie(REFRESH_COOKIE_NAME, options);
}

export const authController = {
  async register(req: Request, res: Response) {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    setRefreshCookie(res, result.refreshToken);
    res.status(201).json({
      success: true,
      data: { accessToken: result.accessToken, expiresIn: result.expiresIn, user: result.user },
      message: 'Account created',
    });
  },

  async login(req: Request, res: Response) {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({
      success: true,
      data: { accessToken: result.accessToken, expiresIn: result.expiresIn, user: result.user },
      message: 'Logged in',
    });
  },

  async googleLogin(req: Request, res: Response) {
    const input = googleLoginSchema.parse(req.body);
    const result = await authService.googleLogin(input.credential);
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({
      success: true,
      data: { accessToken: result.accessToken, expiresIn: result.expiresIn, user: result.user },
      message: 'Logged in with Google',
    });
  },

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (!token) throw ApiError.unauthorized('Refresh session is missing');
    const result = await authService.refresh(token);
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({
      success: true,
      data: { accessToken: result.accessToken, expiresIn: result.expiresIn, user: result.user },
    });
  },

  async logout(req: Request, res: Response) {
    await authService.logout(req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined);
    clearRefreshCookie(res);
    res.status(200).json({ success: true, data: {}, message: 'Logged out' });
  },

  async me(req: Request, res: Response) {
    const user = await authService.getCurrentUser(req.user!.id);
    res.status(200).json({ success: true, data: { user } });
  },

  async changePassword(req: Request, res: Response) {
    const input = changePasswordSchema.parse(req.body);
    await authService.changePassword(req.user!.id, input.currentPassword, input.newPassword);
    clearRefreshCookie(res);
    res
      .status(200)
      .json({ success: true, data: {}, message: 'Password changed; please log in again' });
  },

  async forgotPassword(req: Request, res: Response) {
    const input = identifierSchema.parse(req.body);
    const result = await authService.forgotPassword(input.identifier);
    res.status(200).json({ success: true, message: result.message });
  },

  async verifyResetCode(req: Request, res: Response) {
    const { code, identifier } = req.body;
    if (!code || typeof code !== 'string') {
      throw ApiError.badRequest('Verification code is required');
    }
    const result = await authService.verifyResetCode(code, identifier);
    res.status(200).json({ success: true, data: result });
  },

  async resetPassword(req: Request, res: Response) {
    const { code, password, identifier } = req.body;
    if (!code || typeof code !== 'string') {
      throw ApiError.badRequest('Verification code is required');
    }
    if (!password || typeof password !== 'string') {
      throw ApiError.badRequest('New password is required');
    }
    const result = await authService.resetPassword(code, password, identifier);
    res.status(200).json({ success: true, message: result.message });
  },

  async verifyEmail(_req: Request, res: Response) {
    res.status(200).json({ success: true, message: 'Email verified' });
  },
};
