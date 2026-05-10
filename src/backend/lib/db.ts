import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

let _db: any;

/**
 * Returns a lazy-loaded Drizzle instance.
 * In Cloudflare Workers, the DB binding is passed through env.
 */
export const getDb = (env: any) => {
  if (!_db) {
    _db = drizzle(env.DB, { schema });
  }
  return _db;
};
