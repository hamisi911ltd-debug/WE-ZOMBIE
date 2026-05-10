import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// This is a helper to get the database instance
// In a Cloudflare Worker, the DB binding is passed through env
export const getDb = (env: any) => {
  return drizzle(env.DB, { schema });
};
