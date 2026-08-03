import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';

// Windows/ISP DNS resolver অনেক সময় mongodb+srv:// এর SRV lookup fail করে,
// তাই সরাসরি Google DNS ব্যবহার করে এই সমস্যা এড়ানো হচ্ছে
dns.setServers(['8.8.8.8', '8.8.4.4']);

/**
 * MongoDB connection via Mongoose. Kept as a single exported function so
 * server.ts controls startup order explicitly (connect DB -> connect Redis
 * -> start HTTP server), rather than each module connecting independently.
 */
export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('error', (err) => logger.error(`MongoDB connection error: ${err}`));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

  await mongoose.connect(env.MONGODB_URI);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
