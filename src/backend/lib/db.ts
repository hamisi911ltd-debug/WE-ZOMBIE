import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { cloudflareEnv } from '../../server';

/**
 * Returns a Drizzle instance.
 * In Cloudflare Workers, the DB binding is passed through env.
 */
export const getDb = (env?: any) => {
  const effectiveEnv = env || cloudflareEnv;
  
  if (!effectiveEnv?.DB) {
    console.error('Database binding error:', {
      hasEnv: !!env,
      hasCloudflareEnv: !!cloudflareEnv,
      envKeys: effectiveEnv ? Object.keys(effectiveEnv) : [],
    });
    throw new Error('Database binding (DB) not found in environment');
  }
  
  return drizzle(effectiveEnv.DB, { schema });
};
