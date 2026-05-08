# NewCMS Nuxt Workspace

This workspace contains a Nuxt 3 frontend and the legacy Express backend copied from `C:\Repo\CMSv2\server-09032025`.

## Structure

- `app.vue` — Nuxt root application shell
- `pages/index.vue` — Nuxt home page
- `pages/login.vue` — login page for authenticating with the legacy API
- `pages/people/index.vue` — people directory page that calls `/api/people/all`
- `composables/useAuth.ts` — shared auth state and API helper
- `server/server.js` — legacy Express API server
- `server/app/...` — legacy backend source files

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file from `.env.example` and configure your database / JWT settings.

3. Run the backend server:

   ```bash
   npm run backend
   ```

4. In a separate terminal, run the Nuxt frontend:

   ```bash
   npm run dev
   ```

5. Open the app and navigate to `/login`.

## Usage

- Sign in with an existing user from the legacy backend using `/api/auth/signin`.
- After login, the frontend will store the JWT and fetch people from `/api/people/all`.
- The frontend currently provides a login form and a simple people listing page.

## Notes

- The backend runs separately from Nuxt at `http://localhost:8080`.
- The Nuxt app uses `NUXT_PUBLIC_API_BASE` to configure the API base URL.
- If you want, this frontend can be extended to add registration, people creation, and other API pages.
