import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { cloudflareEnv } from '../../server';

let _db: any;

/**
 * Returns a lazy-loaded Drizzle instance.
 * In Cloudflare Workers, the DB binding is passed through env.
 */
export const getDb = (env?: any) => {
  if (!_db) {
    const effectiveEnv = env || cloudflareEnv || (typeof process !== 'undefined' ? process.env : {});
    if (!effectiveEnv?.DB) {
      throw new Error('Database binding (DB) not found in environment');
    }
    _db = drizzle(effectiveEnv.DB, { schema });
  }
  return _db;
};
