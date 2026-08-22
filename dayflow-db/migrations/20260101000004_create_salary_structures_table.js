/**
 * salary_structures
 * One row per user (Profile.jsx "Salary Info" tab, EmployeeDetail.jsx
 * "Salary Structure" section). Read-only for employees, editable by admin.
 */
exports.up = function (knex) {
  return knex.schema.createTable('salary_structures', (table) => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .unique()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.decimal('basic', 12, 2).notNullable().defaultTo(0);
    table.decimal('hra', 12, 2).notNullable().defaultTo(0);
    table.decimal('allowances', 12, 2).notNullable().defaultTo(0);
    table.decimal('pf', 12, 2).notNullable().defaultTo(0);

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('salary_structures');
};
