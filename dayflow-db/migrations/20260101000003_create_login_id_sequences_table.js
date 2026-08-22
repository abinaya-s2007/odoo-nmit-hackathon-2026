/**
 * login_id_sequences
 * Helper table so the backend can safely generate the next serial number for
 * a given (year, initials) pair when creating an employee, e.g.
 * OI + "RK" + "2026" + "0007". One row per (year, initials); the backend
 * should do this in a transaction:
 *
 *   INSERT ... ON CONFLICT / ON DUPLICATE KEY UPDATE last_serial = last_serial + 1
 *   (or SELECT ... FOR UPDATE then UPDATE) then read back last_serial.
 */
exports.up = function (knex) {
  return knex.schema.createTable('login_id_sequences', (table) => {
    table.integer('year').notNullable();
    table.string('initials', 5).notNullable();
    table.integer('last_serial').notNullable().defaultTo(0);
    table.primary(['year', 'initials']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('login_id_sequences');
};
