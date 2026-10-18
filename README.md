# LMS Pro

## Run locally

1. In `server`, install dependencies and create `.env` from `.env.example`.
2. Set `MONGO_URI` to a reachable MongoDB database and set `JWT_SECRET` to a unique secret.
3. Start the API:

   ```sh
   cd server
   npm install
   npm run dev
   ```

   This workspace uses port `5001` to avoid colliding with other local projects. The API health
   check is at `http://localhost:5001/api/health`.

4. In `client`, install dependencies and configure `VITE_API_URL=http://localhost:5001/api` in `.env`.
   `VITE_GOOGLE_CLIENT_ID` is only needed for Google sign-in; it must match `GOOGLE_CLIENT_ID` in
   `server/.env`.
5. Start the client:

   ```sh
   cd client
   npm install
   npm run dev
   ```

   Open the URL printed by Vite (normally `http://localhost:5173`).

## Create an account and sign in

- Open `/login?tab=register`, enter your name, email and a password of at least 6 characters, then
  choose **Create Account**. Email/password registration creates a student account.
- Return to `/login` and use the same email and password to sign in. Email matching ignores
  capitalization and surrounding spaces.
- There are no built-in demo login credentials. Accounts are stored in the configured MongoDB
  database.
- Admin and teacher roles are not selected in the public registration form. Google sign-in assigns
  those roles only when the email is listed in `ADMIN_EMAILS` or `TEACHER_EMAILS` in `server/.env`.
  An administrator can also add teachers from the admin dashboard.

If authentication fails, check that the API health check responds, MongoDB is reachable, the client
`VITE_API_URL` points to that API, and the account exists in that same database. The login form
displays the API error message when registration or sign-in is rejected.
