import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  // TiDB Configuration
  tidb: {
    host: process.env.TIDB_HOST,
    port: parseInt(process.env.TIDB_PORT || '4000', 10),
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE || 'moneyflow',
    ssl: process.env.TIDB_SSL === 'true',
    url: process.env.DATABASE_URL,
  },

  // Supabase Configuration (for auth)
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
}));
