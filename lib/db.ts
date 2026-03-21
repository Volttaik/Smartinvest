import mongoose from 'mongoose';

import '@/lib/models/User';
import '@/lib/models/Package';
import '@/lib/models/Investment';
import '@/lib/models/Transaction';
import '@/lib/models/Notification';
import '@/lib/models/Trade';

const MONGODB_URI = process.env.MONGODB_URI as string;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cached;

export async function connectDB() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI is not set in environment variables');
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
