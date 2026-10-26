/**
 * Centralized, validated access to environment variables.
 *
 * Why: importing `import.meta.env.X` directly all over the codebase makes
 * typos silent (undefined at runtime) and env access untestable. This module
 * is the single source of truth — validate once here, import the typed
 * object everywhere else.
 */
function getEnvVar(key: keyof ImportMetaEnv, fallback?: string): string {
  const value = import.meta.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const defaultApiUrl = import.meta.env.PROD
  ? 'https://labib-tour-management-system.onrender.com/api/v1'
  : 'http://localhost:5000/api/v1';

const defaultSocketUrl = import.meta.env.PROD
  ? 'https://labib-tour-management-system.onrender.com'
  : 'http://localhost:5000';

export const env = {
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', defaultApiUrl),
  socketUrl: getEnvVar('VITE_SOCKET_URL', defaultSocketUrl),
  appName: getEnvVar('VITE_APP_NAME', 'Labib Tour Management System'),
  cloudinaryCloudName: getEnvVar('VITE_CLOUDINARY_CLOUD_NAME', ''),
  googleClientId: getEnvVar('VITE_GOOGLE_CLIENT_ID', ''),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
