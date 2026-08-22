const { Sequelize } = require('sequelize');
require('dotenv').config();

const dialect = (process.env.DB_DIALECT || 'mysql').toLowerCase();

if (!['mysql', 'postgres'].includes(dialect)) {
  throw new Error(`DB_DIALECT must be "mysql" or "postgres", got "${dialect}"`);
}

const sslEnabled = String(process.env.DB_SSL).toLowerCase() === 'true';

const commonOptions = {
  dialect,
  logging: false,
  define: {
    timestamps: true,
  },
  dialectOptions: sslEnabled
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
};

let sequelize;

if (process.env.DATABASE_URL) {
  // Single connection-string style (works for either engine — Sequelize
  // reads the protocol, e.g. mysql:// or postgres://, from the URL itself).
  sequelize = new Sequelize(process.env.DATABASE_URL, commonOptions);
} else {
  const defaultPort = dialect === 'postgres' ? 5432 : 3306;
  sequelize = new Sequelize(
    process.env.DB_NAME || 'hrms_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      ...commonOptions,
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || defaultPort,
    }
  );
}

module.exports = sequelize;
