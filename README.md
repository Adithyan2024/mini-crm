# Mini CRM (MERN)

React + React Router + MUI + TanStack Query + Axios | Node + Express + MongoDB (Mongoose) | JWT + bcrypt

## Run locally
```bash
# backend
cd server && cp .env.example .env   # set MONGO_URI and JWT_SECRET
npm install && npm run seed && npm run dev
# frontend
cd client && cp .env.example .env
npm install && npm run dev
```
Initial users (created by `npm run seed`, no demo data): `john@mail.com` / `password123`, `priya@mail.com` / `password123`. All leads, companies and tasks are created through the UI and stored in MongoDB.

## Authentication
- `POST /api/auth/login` verifies the password with **bcrypt** and returns a signed **JWT access token**.
- The frontend stores the token and Axios attaches `Authorization: Bearer <token>` to every request.
- The `auth` middleware verifies the token and loads the user into `req.user`. It is mounted on every route except login/register.
- An expired or invalid token returns 401 and the frontend logs the user out.

## Authorization logic
- **Everything except login/register requires a valid JWT.**
- **Leads and Companies:** any authenticated user can create, view and edit them.
- **Tasks:** any authenticated user can create a task for a lead and assign it to any user.
- **Updating task status is restricted to the assignee.** `PATCH /api/tasks/:id/status` compares `task.assignedTo` with `req.user._id`
  and returns **403** otherwise. This is enforced on the server; the UI also disables the dropdown for other users' tasks.
- The user id always comes from the verified token, never from the request body, so it cannot be spoofed.

## Soft delete
`DELETE /api/leads/:id` sets `isDeleted: true`. Mongoose pre-hooks on `Lead` add `isDeleted: false` to every
find/findOne/count/update query and to every aggregation, so deleted leads never appear in lists, search,
company detail, or dashboard counts. They can only be reached deliberately with `.setOptions({ withDeleted: true })`.

## Dashboard
`GET /api/dashboard` uses MongoDB aggregation pipelines for Total Leads, Qualified Leads, Tasks Due Today and Completed Tasks.

## Deploy
- **Backend (Render/Railway):** root `server`, start `npm start`, env: `MONGO_URI` (MongoDB Atlas), `JWT_SECRET`, `CLIENT_URL` (your Netlify URL).
- **Frontend (Netlify):** base `client`, build `npm run build`, publish `dist`, env `VITE_API_URL=https://<backend-url>/api`.
  `public/_redirects` handles React Router refreshes.

## API summary
| Module | Endpoints |
|---|---|
| Auth | POST /auth/register, POST /auth/login, GET /auth/me |
| Users | GET /users |
| Leads | GET /leads?page&limit&search&status, POST /leads, GET/PUT/DELETE /leads/:id, PATCH /leads/:id/status |
| Companies | GET /companies, POST /companies, GET /companies/:id (company + leads) |
| Tasks | GET /tasks, POST /tasks, PATCH /tasks/:id/status (assignee only) |
| Dashboard | GET /dashboard |
