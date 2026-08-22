const bcrypt = require('bcryptjs');

// Demo password for every seeded account: "Password123!"
const DEMO_PASSWORD = 'Password123!';

exports.seed = async function (knex) {
  // Clean slate, respecting FK order (children first).
  await knex('auth_tokens').del();
  await knex('dashboard_alerts').del();
  await knex('leave_requests').del();
  await knex('leave_balances').del();
  await knex('attendance').del();
  await knex('employee_documents').del();
  await knex('salary_structures').del();
  await knex('login_id_sequences').del();
  await knex('users').del();
  await knex('companies').del();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const [companyId] = await knex('companies')
    .insert({ name: 'Dayflow Demo Co', logo_url: null })
    .returning('id');
  const companyIdValue = companyId.id ?? companyId; // works for both pg (object) and mysql (raw id)

  const [adminId] = await knex('users')
    .insert({
      company_id: companyIdValue,
      login_id: 'OIAD20260001',
      name: 'Asha Admin',
      email: 'admin@dayflow.test',
      phone: '+91-9000000001',
      password_hash: passwordHash,
      role: 'admin',
      employment_status: 'active',
      job_title: 'HR Manager',
      department: 'Human Resources',
      join_date: '2024-01-10',
      email_verified_at: knex.fn.now(),
    })
    .returning('id');
  const adminIdValue = adminId.id ?? adminId;

  const [empId] = await knex('users')
    .insert({
      company_id: companyIdValue,
      login_id: 'OIRK20260002',
      name: 'Ravi Kumar',
      email: 'ravi.kumar@dayflow.test',
      phone: '+91-9000000002',
      password_hash: passwordHash,
      role: 'employee',
      employment_status: 'active',
      job_title: 'Software Engineer',
      department: 'Engineering',
      join_date: '2024-03-01',
      about: 'Frontend engineer who enjoys clean UI and clean commits.',
      skills: 'React, JavaScript, CSS',
      email_verified_at: knex.fn.now(),
    })
    .returning('id');
  const empIdValue = empId.id ?? empId;

  await knex('salary_structures').insert([
    { user_id: adminIdValue, basic: 60000, hra: 24000, allowances: 8000, pf: 7200 },
    { user_id: empIdValue, basic: 45000, hra: 18000, allowances: 5000, pf: 5400 },
  ]);

  await knex('leave_balances').insert([
    { user_id: adminIdValue, paid_days: 12, sick_days: 6, unpaid_days_taken: 0 },
    { user_id: empIdValue, paid_days: 10, sick_days: 5, unpaid_days_taken: 0 },
  ]);

  const today = new Date().toISOString().slice(0, 10);
  await knex('attendance').insert([
    {
      user_id: empIdValue,
      work_date: today,
      check_in: `${today} 09:32:00`,
      check_out: `${today} 18:10:00`,
      work_hours: 8.6,
      extra_hours: 0.6,
      status: 'present',
    },
  ]);

  await knex('leave_requests').insert([
    {
      user_id: empIdValue,
      type: 'Paid time off',
      start_date: '2026-09-05',
      end_date: '2026-09-06',
      allocation_days: 2,
      remarks: 'Family function',
      status: 'pending',
    },
  ]);

  await knex('dashboard_alerts').insert([
    { user_id: empIdValue, message: 'Your leave request is pending approval.', is_read: false },
    { user_id: adminIdValue, message: 'Ravi Kumar submitted a new leave request.', is_read: false },
  ]);

  await knex('login_id_sequences').insert([
    { year: 2026, initials: 'AD', last_serial: 1 },
    { year: 2026, initials: 'RK', last_serial: 2 },
  ]);

  console.log('Seed complete. Demo login: admin@dayflow.test / ravi.kumar@dayflow.test');
  console.log(`Demo password for both: ${DEMO_PASSWORD}`);
};
