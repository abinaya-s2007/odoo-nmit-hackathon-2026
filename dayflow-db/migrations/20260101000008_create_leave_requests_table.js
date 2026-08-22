/**
 * leave_requests
 * TimeOff.jsx: employee applies (type, startDate, endDate, allocationDays,
 * remarks); admin approves/rejects with an optional comment.
 * type:   'Paid time off' | 'Sick Leave' | 'Unpaid Leaves'
 * status: 'pending' | 'approved' | 'rejected'
 */
exports.up = function (knex) {
  return knex.schema.createTable('leave_requests', (table) => {
    table.increments('id').primary();

    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.string('type', 30).notNullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.decimal('allocation_days', 5, 2).notNullable().defaultTo(1);
    table.string('remarks', 500).nullable();
    table.string('attachment_url', 500).nullable();

    table.string('status', 20).notNullable().defaultTo('pending');
    table.string('decision_comment', 500).nullable();
    table
      .integer('decided_by')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.timestamp('decided_at').nullable();

    table.timestamps(true, true);

    table.index(['user_id']);
    table.index(['status']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('leave_requests');
};
