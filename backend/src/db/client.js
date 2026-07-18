import pkg from 'pg';

const { Pool } = pkg;

let pool;

function createPool() {
  const connectionConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      };

  return new Pool({
    ...connectionConfig,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

export async function getDbClient() {
  if (!pool) {
    pool = createPool();
  }
  return pool.connect();
}

export function closePool() {
  if (pool) {
    return pool.end();
  }
  return Promise.resolve();
}
