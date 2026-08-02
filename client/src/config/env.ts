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

export const env = {
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:5000/api/v1'),
  socketUrl: getEnvVar('VITE_SOCKET_URL', 'http://localhost:5000'),
  appName: getEnvVar('VITE_APP_NAME', 'Labib Tour Management System'),
  cloudinaryCloudName: getEnvVar('VITE_CLOUDINARY_CLOUD_NAME', ''),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
