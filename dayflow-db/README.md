# Dayflow HRMS — Database

This is the database layer for the Dayflow HRMS frontend. It's built with
**Knex.js**, a JS query/migration builder — the exact same migration files
create an identical schema on **MySQL** or **PostgreSQL**; you just flip one
env variable. Your backend teammate can `require()` the same connection
(`db/knex.js`) to run queries, so there's no separate "SQL for MySQL" /
"SQL for Postgres" to keep in sync.

## What's in here

```
dayflow-db/
├── knexfile.js          # DB connection config (reads .env)
├── db/knex.js           # Shared connection — backend imports this
├── migrations/          # One file per table, run in order
├── seeds/01_dev_seed.js # Demo company + admin + employee + sample data
├── package.json
└── .env.example
```

## 1. Install prerequisites

- Node.js 18+
- Either a running **MySQL 8+** server, or a running **PostgreSQL 13+** server (you only need one — pick whichever your team prefers)

## 2. Install dependencies

```bash
cd dayflow-db
npm install
```

This installs `knex`, `mysql2`, `pg`, `bcryptjs`, and `dotenv` — both DB
drivers are installed either way, so switching engines later never needs a
`npm install` again.

## 3. Create the database

**MySQL:**
```bash
mysql -u root -p -e "CREATE DATABASE dayflow_hrms;"
```

**PostgreSQL:**
```bash
createdb dayflow_hrms
# or: psql -U postgres -c "CREATE DATABASE dayflow_hrms;"
```

## 4. Configure the connection

```bash
cp .env.example .env
```

Edit `.env`:

- To use **MySQL**: set `DB_CLIENT=mysql` and fill in your MySQL host/user/password/port (default 3306).
- To use **PostgreSQL**: set `DB_CLIENT=postgres` and fill in your Postgres host/user/password/port (default 5432).

That single `DB_CLIENT` value is all that changes between the two databases.

## 5. Run the migrations

```bash
npm run migrate
```

This creates all 10 tables in order. To check what's been applied:

```bash
npm run migrate:status
```

To undo the last migration batch (e.g. while iterating):

```bash
npm run migrate:rollback
```

## 6. Load demo data (optional but recommended)

```bash
npm run seed
```

This creates one company, one admin account, and one employee account so
the frontend has something to log into right away:

| Role     | Email                     | Password       |
|----------|----------------------------|----------------|
| Admin/HR | admin@dayflow.test        | Password123!   |
| Employee | ravi.kumar@dayflow.test   | Password123!   |

## 7. Hand this to the backend

The backend just imports the shared connection and queries like normal SQL:

```js
const db = require('../dayflow-db/db/knex');

// Sign in
const user = await db('users').where({ email }).first();

// Employee list for the Admin dashboard
const employees = await db('users').where({ company_id, role: 'employee' });

// Attendance for a given day
const rows = await db('attendance')
  .join('users', 'users.id', 'attendance.user_id')
  .where({ work_date: date });
```

Knex also runs raw SQL if preferred: `db.raw('SELECT * FROM users WHERE id = ?', [id])`.

---

## Schema overview

| Table                 | Purpose                                                              | Frontend reference |
|------------------------|-----------------------------------------------------------------------|---------------------|
| `companies`            | One row per registered company (multi-tenant root)                   | SignUp.jsx |
| `users`                | Admin/HR and Employee accounts, profile + job fields                 | AuthContext, Profile.jsx, EmployeeDetail.jsx |
| `login_id_sequences`   | Tracks the next serial for the `OI[Initials][Year][Serial]` login ID  | Employees.jsx (NewEmployeeModal note) |
| `salary_structures`    | Basic / HRA / allowances / PF, one row per user                      | Profile.jsx "Salary Info", EmployeeDetail.jsx |
| `employee_documents`   | Uploaded documents shown on the Resume tab                            | Profile.jsx "Resume" |
| `attendance`           | One row per user per day: check-in/out, hours, status                | Attendance.jsx |
| `leave_balances`       | Remaining paid/sick days                                              | TimeOff.jsx (balance cards) |
| `leave_requests`       | Leave applications + approve/reject workflow                          | TimeOff.jsx (employee + admin views) |
| `dashboard_alerts`     | "Recent activity" feed on the employee home screen                    | Home.jsx |
| `auth_tokens`          | Email verification & password-reset tokens                            | Spec 3.1.1 (email verification) |

### Notes on design decisions

- **Roles as plain strings, not native ENUM columns.** MySQL and Postgres
  implement `ENUM` completely differently under the hood. Using
  `VARCHAR` + validating allowed values (`admin` / `hr` / `employee`,
  `pending` / `approved` / `rejected`, etc.) in the backend keeps every
  migration byte-for-byte identical across both engines. If you later want
  the database itself to reject bad values, add a `CHECK` constraint —
  that syntax is one of the few things that does differ between MySQL and
  Postgres, so it's kept out of the shared migrations on purpose.
- **`login_id_sequences`** exists because generating `OI[Initials][Year][Serial]`
  safely under concurrent employee creation needs an atomic counter. Have
  the backend increment it inside a transaction (`SELECT ... FOR UPDATE`
  on Postgres, or `INSERT ... ON DUPLICATE KEY UPDATE last_serial = last_serial + 1`
  on MySQL) rather than computing "count of existing users + 1" from the
  `users` table, which isn't safe against two admins creating employees at
  the same second.
- **Passwords** are stored only as `password_hash` — hash with `bcryptjs`
  (already a dependency here) before insert; never store plaintext.
- **JWTs are stateless** — there's intentionally no `sessions` table. If you
  later want the ability to revoke tokens/log out other devices, add a
  `refresh_tokens` table following the same pattern as `auth_tokens`.
