/**
 * employee_documents
 * Files listed under Profile.jsx "Resume" tab (profile.documents: [{name,url}]).
 */
exports.up = function (knex) {
  return knex.schema.createTable('employee_documents', (table) => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.string('name', 255).notNullable();
    table.string('url', 500).notNullable();

    table.timestamp('uploaded_at').notNullable().defaultTo(knex.fn.now());

    table.index(['user_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('employee_documents');
};
