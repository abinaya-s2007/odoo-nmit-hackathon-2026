// Shared DB connection for the backend team to import, e.g.:
//   const db = require('../dayflow-db/db/knex')
//   const user = await db('users').where({ email }).first()
const knexConfig = require('../knexfile');

const environment = process.env.NODE_ENV || 'development';

const db = require('knex')(knexConfig[environment]);

module.exports = db;
