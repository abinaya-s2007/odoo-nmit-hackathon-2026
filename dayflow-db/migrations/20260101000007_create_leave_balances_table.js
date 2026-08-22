/**
 * leave_balances
 * One row per user (TimeOff.jsx GET /timeoff/balance -> { paid, sick }).
 * unpaid_days is tracked for completeness even though it has no cap in the UI.
 */
exports.up = function (knex) {
  return knex.schema.createTable('leave_balances', (table) => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .unique()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.decimal('paid_days', 5, 2).notNullable().defaultTo(0);
    table.decimal('sick_days', 5, 2).notNullable().defaultTo(0);
    table.decimal('unpaid_days_taken', 5, 2).notNullable().defaultTo(0);

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('leave_balances');
};
