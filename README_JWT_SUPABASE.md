# FishApp - Supabase + JWT migration

## What changed
- TiDB/MySQL driver replaced with PostgreSQL `pg`.
- Authentication now uses JWT stored in an HttpOnly cookie.
- Browser `localStorage` is no longer used for authentication/user state.
- `/api/auth/me` restores the current user after refresh.
- `/api/auth/logout` clears the JWT cookie.
- Admin and employee APIs are protected by role middleware.
- `/api/capture` remains public because it is the simulated phishing landing endpoint; it records the event but never stores the submitted password.

## Setup
1. Create a Supabase project.
2. Run the existing/base database schema first.
3. Run `supabase_jwt_migration.sql` in Supabase SQL Editor.
4. Copy `server/.env.example` to `server/.env`.
5. Set `DATABASE_URL` to your Supabase PostgreSQL connection string.
6. Set `JWT_SECRET` to a long random secret.
7. Set `CLIENT_URL=http://localhost:5173` for local development. For Render production, set it to the Vercel URL without a trailing slash. Set `NODE_ENV=production` on Render so the cross-site JWT cookie is secure.
8. Install dependencies from the project root with `npm install`.
9. Start the backend with `npm run server` and the frontend with `npm run dev`.
10. For local development, leave `VITE_BACKEND_URL` unset; Vite proxies `/api` to `http://localhost:5000`.
11. In Vercel, set `VITE_BACKEND_URL` to the deployed Render backend URL, including `https://` and without a trailing slash, then redeploy.
12. Vite reads frontend environment files from `client/`, not `client/src/`; use `client/.env.example` as the template.

## Important
Do not commit `server/.env` or any API/email/Twilio credentials. Rotate credentials if they have already been exposed.

## Frontend authentication
The frontend calls `/api/auth/me` after a page refresh. The JWT itself is never readable by React because it is stored in an HttpOnly cookie. API requests use `credentials: 'include'` through `client/src/api.js`.
