# Dayflow HRMS — Frontend Skeleton

## Run it
```bash
npm install
cp .env.example .env      # then set VITE_API_URL to the backend's URL
npm run dev
```
Opens at http://localhost:5173

## What's here
- Routing + auth guard (`/signin`, `/signup` are public; everything else requires login)
- `src/context/AuthContext.jsx` — login/signup/logout, token stored in localStorage
- `src/api/client.js` — single axios instance, base URL from `.env`
- Every page has the exact **API contract in a comment** at the top of the file.
  Swap in real endpoints once the backend is live; error states are shown inline
  if a call fails, so the UI degrades gracefully rather than breaking.

## Role-based access (spec section 2 & 3.1–3.6)
`user.role` (from `/auth/login` or `/auth/signup`) is `'employee'`, `'hr'`, or `'admin'`.
`hr`/`admin` are treated as one "Admin/HR" class throughout, per `isAdmin` checks
in each page. Routing enforces this via `AdminRoute` in `ProtectedRoute.jsx`.

| Area | Employee | Admin / HR |
|---|---|---|
| Landing page (`/`) | `Home.jsx` — quick-access dashboard cards + recent activity (3.2.1) | `Employees.jsx` — full directory, click into any employee (3.2.2) |
| Employees list/detail (`/employees`, `/employees/:id`) | No access (route-guarded) | Browse, create, and edit any employee's full record incl. salary (3.3.2, 3.6.2) |
| Profile (`/profile`) | Edit own phone, address, photo, about/skills only; salary shown read-only (3.3.2, 3.6.1) | Same self-service scope for their own profile; use Employees list to edit others |
| Attendance (`/attendance`) | Sees only their own attendance (`GET /attendance/me`) (3.4.2) | Sees everyone's attendance (`GET /attendance`) |
| Time Off (`/timeoff`) | Apply for leave + see balance (3.5.1) | Review all requests, approve/reject with a comment (3.5.2) |

## Before wiring to the real backend
1. Confirm field names in each page's comment block match what the backend
   actually returns (I guessed sensible names — they need sign-off).
2. Set `VITE_API_URL` in `.env` to the backend's real base URL.
3. Confirm CORS is enabled on the backend for `http://localhost:5173`.
4. Confirm how the backend expects the auto-generated employee login ID
   (`OI[Initials][Year][Serial]`) and temp password to be delivered — the
   "New Employee" modal currently just POSTs the form and assumes the backend
   handles ID generation + the welcome email.

## Still TODO (not built yet)
- Analytics & reports dashboard (salary slips, attendance reports — section 5)
- Email/notification alerts wiring (section 5)
- Real file upload handling for company logo / attachments (currently sent as
  multipart but untested against a real backend)
