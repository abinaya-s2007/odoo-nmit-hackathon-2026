/**
 * dashboard_alerts
 * Home.jsx GET /dashboard/alerts -> [{ id, message, date }] ("Recent activity").
 */
exports.up = function (knex) {
  return knex.schema.createTable('dashboard_alerts', (table) => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.string('message', 500).notNullable();
    table.timestamp('alert_date').notNullable().defaultTo(knex.fn.now());
    table.boolean('is_read').notNullable().defaultTo(false);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.index(['user_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('dashboard_alerts');
};
