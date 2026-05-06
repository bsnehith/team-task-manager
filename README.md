# TeamFlow - Team Task Manager

TeamFlow is a full-stack team task management application with:

- JWT authentication (signup/login/logout)
- Role-based access (global and project-level roles)
- Project and task management
- Task comments and activity history
- In-app notifications
- Search, filter, sort, and pagination
- Responsive UI built with React + TailwindCSS

---

## Tech Stack

### Frontend
- React (Vite)
- React Router
- Axios
- TailwindCSS
- Lucide React

### Backend
- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT + bcryptjs
- Zod validation

---

## Project Structure

```text
team-task-manager/
  client/                  # React frontend
  server/                  # Express + Prisma backend
  .gitignore
  README.md
```

---

## Prerequisites

Install the following:

- Node.js 20+ (recommended LTS)
- npm
- PostgreSQL 14+ (or compatible)

---

## Environment Variables

### Backend (`server/.env`)

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/team_task_manager?schema=public"
JWT_SECRET=your_strong_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Use `server/.env.example` as reference.

### Frontend (`client/.env`)

Optional (if backend URL differs from default):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

If omitted, frontend uses `http://localhost:5000/api` by default.

---

## Setup Instructions

## 1) Clone repository

```bash
git clone https://github.com/bsnehith/team-task-manager.git
cd team-task-manager
```

## 2) Install dependencies

### Backend
```bash
cd server
npm install
```

### Frontend
```bash
cd ../client
npm install
```

---

## Database Setup (Prisma + PostgreSQL)

From `server/`:

## 1) Push schema to database
```bash
npx prisma db push
```

## 2) Generate Prisma client
```bash
npx prisma generate
```

## 3) (Optional) Open Prisma Studio
```bash
npx prisma studio
```

> If you prefer migration files:
> ```bash
> npx prisma migrate dev -n init
> ```

---

## Run the Project

Run backend and frontend in separate terminals.

### Terminal A - Backend
```bash
cd server
npm run dev
```

Backend runs at:
- `http://localhost:5000`

### Terminal B - Frontend
```bash
cd client
npm run dev
```

Frontend runs at:
- `http://localhost:5173`

---

## Available Scripts

### Backend (`server/package.json`)
- `npm run dev` - start backend with nodemon
- `npm run start` - start backend in production mode
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate` - run Prisma migrate dev
- `npm run prisma:deploy` - deploy migrations
- `npm run prisma:studio` - open Prisma Studio

### Frontend (`client/package.json`)
- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

---

## Core Features

## Authentication
- Signup/Login with JWT
- Strong password validation
- Show/hide password fields
- Forgot password flow (current app flow)

## Authorization
- Global roles: `ADMIN`, `MEMBER`
- Project roles: `VIEWER`, `EDITOR`, `MANAGER`, `ADMIN`
- Permission checks on create/update/delete actions

## Projects
- Create, list, search, sort, paginate projects
- Project member management and role updates
- Delete project (role-gated)

## Tasks
- Create/update/delete tasks
- Assign tasks to project members
- Status, priority, due date management
- Search/filter/sort/pagination

## Collaboration
- Task comments
- Task activity history/audit trail
- Notifications (assignment, updates, due reminders)

---

## API Base Routes (high-level)

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:projectId`
- `POST /api/projects/:projectId/members`
- `DELETE /api/projects/:projectId/members/:userId`
- `GET /api/projects/:projectId/tasks`
- `POST /api/projects/:projectId/tasks`
- `PATCH /api/tasks/:taskId`
- `DELETE /api/tasks/:taskId`
- `GET /api/tasks/:taskId/comments`
- `POST /api/tasks/:taskId/comments`
- `GET /api/tasks/:taskId/activity`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `PATCH /api/notifications/read-all`

---

## Troubleshooting

## Prisma error: `Cannot read properties of undefined (reading 'create')`
Usually means Prisma client is outdated for current schema.

From `server/`:
```bash
npx prisma db push
npx prisma generate
```
Then restart backend.

## Port conflicts
- Change backend `PORT` in `server/.env`
- Update frontend `VITE_API_BASE_URL` if needed

## CORS issues
Ensure `CLIENT_URL` in backend `.env` matches frontend URL.

## Ignored files not ignoring
If files were tracked before adding `.gitignore`, untrack them:
```bash
git rm -r --cached node_modules
git rm --cached .env
```

---

## Security Notes

- Never commit `.env` files
- Use a strong `JWT_SECRET`
- Rotate secrets in production
- Use managed email provider for production mail workflows

---

## Future Enhancements (recommended)

- Email token-based secure reset flow
- File attachments for tasks (S3/Cloudinary)
- Subtasks/checklist
- Calendar view (month/week)
- Export reports (CSV/PDF)

---

## License

This project is for learning and portfolio/demo use.  
You can add your preferred license (MIT recommended) if needed.
