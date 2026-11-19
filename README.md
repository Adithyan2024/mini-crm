# Mini CRM

A small CRM built with the MERN stack for an interview assignment. You can manage leads, companies and tasks, and see a few numbers on a dashboard.

**Live app:** https://mini-crm-app-q5g2.onrender.com
**API:** https://mini-crm-smr9.onrender.com/api/health

Both are on Render's free tier. If nobody has used the app for a while, the backend goes to sleep and the first request can take up to a minute. Give it a moment and try again.

## Stack

- Frontend: React, React Router, MUI, Axios, TanStack Query (Vite)
- Backend: Node.js, Express
- Database: MongoDB with Mongoose (hosted on Atlas)
- Auth: JWT access token, passwords hashed with bcrypt

## What it does

- **Auth:** register, login, logout. Every page except login and register needs a valid token.
- **Dashboard:** total leads, qualified leads, tasks due today, completed tasks. The numbers come from MongoDB aggregation, not from counting on the frontend.
- **Leads:** create, edit, list, change status, delete. The list has pagination, search by name or email, and a status filter.
- **Companies:** create, list, and a detail page that shows the company's leads.
- **Tasks:** create a task for a lead, assign it to a user, update its status.

## Running it locally

You need Node 18+ and a MongoDB database (a free Atlas cluster is fine).

```bash
# backend
cd server
cp .env.example .env     # fill in the values below
npm install
npm run dev

# frontend (second terminal)
cd client
cp .env.example .env
npm install
npm run dev
```

The frontend runs on http://localhost:5173 and the backend on http://localhost:5000.

There is a register page, so you can just create an account. If you would rather have a couple of users ready, `npm run seed` in the server folder creates `john@mail.com` and `priya@mail.com` (both with password `password123`). It only creates users and skips ones that already exist.

### Environment variables

`server/.env`

| Name | What it is |
|---|---|
| `PORT` | Port for the API (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign tokens |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1d` |
| `CLIENT_URL` | Frontend URL allowed by CORS (no trailing slash) |

`client/.env`

| Name | What it is |
|---|---|
| `VITE_API_URL` | Backend URL including `/api` |

## Authentication

On login the server checks the password against the bcrypt hash and returns a signed JWT. The frontend keeps it in localStorage and Axios sends it as `Authorization: Bearer <token>` on every request.

An `auth` middleware verifies the token and loads the user into `req.user`. It is applied to every route except register and login. A missing, invalid or expired token gets a 401, and the frontend logs the user out when it sees one.

## Authorization

The rules are:

- Any logged-in user can view and edit leads and companies.
- Any logged-in user can create a task and assign it to any user.
- **Only the user a task is assigned to can change its status.**

The last rule is checked on the server, in `PATCH /api/tasks/:id/status`. It compares `task.assignedTo` with the id of the user from the token, and returns 403 if they don't match. The user always comes from the verified token and never from the request body, so it can't be faked from the client. The status dropdown is also disabled in the UI for other people's tasks, but that is only for convenience. The real check is in the API.

I didn't add roles like admin or manager because the assignment only asks for the task rule. They could be added later with another middleware.

## Soft delete

Deleting a lead doesn't remove it. It sets `isDeleted: true` and stores a `deletedAt` date.

To make sure deleted leads never show up by accident, the Lead model has Mongoose hooks that add `isDeleted: false` to every `find`, `findOne`, `countDocuments` and update query, and to every aggregation. So deleted leads are missing from the lead list, search results, the company detail page and the dashboard numbers. If you ever need them, you have to ask for them explicitly with `.setOptions({ withDeleted: true })`.

## Project structure

```
client/                 React app
  src/api/              Axios instance
  src/components/       Layout, auth screen, shared bits
  src/context/          Auth context
  src/pages/            Login, Register, Dashboard, Leads, LeadForm,
                        Companies, CompanyDetail, Tasks
server/
  src/models/           User, Company, Lead, Task
  src/routes/           auth, users, leads, companies, tasks, dashboard
  src/middleware/       JWT auth
  src/seed.js           optional script to create two users
```

## API

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Users | `GET /api/users` |
| Leads | `GET /api/leads?page&limit&search&status`, `POST /api/leads`, `GET /api/leads/:id`, `PUT /api/leads/:id`, `PATCH /api/leads/:id/status`, `DELETE /api/leads/:id` |
| Companies | `GET /api/companies`, `POST /api/companies`, `GET /api/companies/:id` |
| Tasks | `GET /api/tasks`, `POST /api/tasks`, `PATCH /api/tasks/:id/status` |
| Dashboard | `GET /api/dashboard` |

## Deployment

Both parts are hosted on Render.

**Backend (Web Service)**
- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Environment: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL` (the frontend URL)

**Frontend (Static Site)**
- Root directory: `client`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment: `VITE_API_URL` (backend URL + `/api`)
- A rewrite rule from `/*` to `/index.html` so refreshing on a page like `/leads` works with React Router

The MongoDB Atlas network access list allows `0.0.0.0/0`, since Render's free instances don't have a fixed IP.

## Assumptions

- The wireframe lists New, Contacted and Lost as lead statuses, but the dashboard has a "Qualified Leads" card, so I added **Qualified** as a status.
- "Tasks due today" counts all unfinished tasks due today, not only the logged-in user's.
- Leads are linked to a company and an assigned user, but both are optional when creating a lead.