import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';

// Resolve DNS SRV query issues on local ISP networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // ignore in environments where setting DNS servers is restricted
}

mongoose.set('strictQuery', true);

mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
mongoose.connection.on('error', (error) => logger.error('MongoDB connection error', { error }));
mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

let connectionPromise: Promise<typeof mongoose> | undefined;

export async function connectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  if (connectionPromise) {
    await connectionPromise;
    return;
  }

  connectionPromise = mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
  });

  try {
    await connectionPromise;
  } finally {
    connectionPromise = undefined;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}

export function getDatabaseStatus(): 'connected' | 'disconnected' | 'connecting' {
  switch (mongoose.connection.readyState) {
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    default:
      return 'disconnected';
  }
}
