/**
 * companies
 * Created on Sign Up (SignUp.jsx posts companyName + logo). Every user
 * belongs to exactly one company — this is what makes Dayflow multi-tenant
 * (each company only ever sees its own employees).
 */
exports.up = function (knex) {
  return knex.schema.createTable('companies', (table) => {
    table.increments('id').primary();
    table.string('name', 150).notNullable();
    table.string('logo_url', 500).nullable();
    table.timestamps(true, true); // created_at, updated_at
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('companies');
};
