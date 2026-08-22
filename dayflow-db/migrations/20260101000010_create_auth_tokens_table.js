/**
 * auth_tokens
 * Backs "Email verification is required" (spec 3.1.1) and any future
 * forgot-password flow. type: 'email_verification' | 'password_reset'
 */
exports.up = function (knex) {
  return knex.schema.createTable('auth_tokens', (table) => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.string('token', 255).notNullable().unique();
    table.string('type', 30).notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('used_at').nullable();

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.index(['user_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('auth_tokens');
};
