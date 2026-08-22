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
- Pages: SignIn, SignUp, Employees (dashboard grid), Attendance, TimeOff, Profile
- Every page currently has **mock data + the exact API contract in a comment**
  at the top of the file. Swap in the real call once the backend endpoint is live —
  the mock is only a network-error fallback, so the UI keeps working even if the
  backend isn't ready yet.

## Before wiring to the real backend
1. Confirm field names in each page's comment block match what the backend
   actually returns (I guessed sensible names — they need sign-off).
2. Set `VITE_API_URL` in `.env` to the backend's real base URL.
3. Confirm CORS is enabled on the backend for `http://localhost:5173`.

## Still TODO (not built yet)
- Payroll view
- Employee creation modal ("NEW" button on Employees page is a stub)
- Real file upload handling for company logo / attachments
