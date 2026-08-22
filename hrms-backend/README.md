# Dayflow HRMS — Backend

Node.js + Express + Sequelize. Implements every endpoint the frontend
(`src/**/*.jsx` API-contract comments) already expects. Switch between
MySQL and PostgreSQL with a single env var — no code changes.

## 1. Install & configure (2 min)

```bash
cd hrms-backend
npm install
cp .env.example .env
```

Edit `.env`:
- `DB_DIALECT=mysql` or `DB_DIALECT=postgres`
- Fill in `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD`
  (or set a single `DATABASE_URL` instead — both work)
- Create the empty database first, e.g.:
  - MySQL: `CREATE DATABASE hrms_db;`
  - Postgres: `CREATE DATABASE hrms_db;`

## 2. Run (30 sec)

```bash
npm run dev      # nodemon, auto-restarts
# or
npm start
```

On boot it connects, then runs `sequelize.sync({ alter: true })`, which
creates all tables automatically — **no manual migrations needed**.
You should see:

```
[HRMS] Connected to mysql database.
[HRMS] Models synced.
[HRMS] Backend listening on http://localhost:8000
```

## 3. Point the frontend at it

In `hrms-frontend/.env`:
```
VITE_API_URL=http://localhost:8000/api
```

## Flow to demo

1. **Sign Up** (`/signup`) — creates the Company + first Admin user.
   Login ID is auto-generated as `OI[Initials][Year][Serial]`
   (e.g. `OIJODO20260001`), matching the wireframe spec exactly.
2. **Sign In** as that admin — lands on the Employees directory.
3. Click **NEW** → create an employee. Their login ID + a random temp
   password are generated and printed to the backend console (in a real
   deployment these would be emailed).
4. Sign in as that employee (open an incognito tab) using the printed
   loginId + temp password.
5. Check In / Check Out from the profile-picture dropdown → shows up on
   the Attendance page for both the employee and the admin.
6. Apply for Time Off as the employee → approve/reject as the admin.
7. Edit Profile (phone/address/about/skills) as the employee; edit the
   full record incl. salary as the admin from the Employees list.

## API summary

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | /api/auth/signup | public | creates Company + Admin |
| POST | /api/auth/login | public | email or loginId + password |
| GET | /api/employees | admin/hr | directory with live status dot |
| POST | /api/employees | admin/hr | auto-generates loginId + temp password |
| GET | /api/employees/:id | admin/hr | full record incl. salary |
| PATCH | /api/employees/:id | admin/hr | edit full record incl. salary |
| GET | /api/profile | self | own profile |
| PATCH | /api/profile | self | phone/address/about/skills only |
| POST | /api/profile/avatar | self | multipart `avatar` field |
| POST | /api/profile/password | self | change own password |
| POST | /api/attendance/check-in | self | |
| POST | /api/attendance/check-out | self | computes work/extra hours |
| GET | /api/attendance/me?date= | self | |
| GET | /api/attendance?date= | admin/hr | everyone in the company |
| GET | /api/timeoff/balance | self | paid/sick days left |
| POST | /api/timeoff/request | self | |
| GET | /api/timeoff/requests | admin/hr | all requests |
| PATCH | /api/timeoff/requests/:id | admin/hr | approve/reject, decrements balance |
| GET | /api/dashboard/alerts | self | recent activity feed |

All protected routes need `Authorization: Bearer <token>` (the frontend's
axios client already attaches this automatically).

## Why this works on both MySQL and PostgreSQL

Everything goes through Sequelize models (`src/models/*.js`) — there is no
raw, dialect-specific SQL anywhere. `src/config/db.js` reads `DB_DIALECT`
and builds the connection accordingly; `mysql2` and `pg`/`pg-hstore` are
both installed so either driver is available at runtime. To switch, stop
the server, point `.env` at the other database, and restart — the schema
is recreated automatically by `sync({ alter: true })`.
