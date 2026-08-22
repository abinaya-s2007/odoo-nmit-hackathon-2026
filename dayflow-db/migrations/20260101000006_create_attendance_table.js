/**
 * attendance
 * One row per user per calendar day (Attendance.jsx: check-in/out, work
 * hours, extra hours, status). status: 'present' | 'absent' | 'half-day' | 'leave'
 */
exports.up = function (knex) {
  return knex.schema.createTable('attendance', (table) => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.date('work_date').notNullable();
    table.timestamp('check_in').nullable();
    table.timestamp('check_out').nullable();
    table.decimal('work_hours', 5, 2).nullable();
    table.decimal('extra_hours', 5, 2).nullable();
    table.string('status', 20).notNullable().defaultTo('absent'); // present | absent | half-day | leave

    table.timestamps(true, true);

    // One attendance record per employee per day.
    table.unique(['user_id', 'work_date']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('attendance');
};
