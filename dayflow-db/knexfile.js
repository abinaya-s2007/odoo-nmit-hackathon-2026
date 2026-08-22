require('dotenv').config();

// One config, two databases. Flip DB_CLIENT in .env between "mysql" and
// "postgres" and every migration/seed below runs unchanged on either engine.
const client = process.env.DB_CLIENT === 'postgres' ? 'pg' : 'mysql2';

const defaultPort = client === 'pg' ? 5432 : 3306;

module.exports = {
  development: {
    client,
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || defaultPort,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    pool: { min: 2, max: 10 },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },

  // Duplicate this block (e.g. "production") and point it at your prod
  // DB_HOST/DB_NAME when you're ready to deploy. Same client, same migrations.
  production: {
    client,
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || defaultPort,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    pool: { min: 2, max: 10 },
    migrations: { directory: './migrations', tableName: 'knex_migrations' },
  },
};
