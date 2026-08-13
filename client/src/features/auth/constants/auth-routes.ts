/** Central path constants — every auth Link/redirect in the app imports from here, never hardcodes a route string. */
export const AUTH_ROUTES = {
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',
  unauthorized: '/unauthorized',
} as const;
