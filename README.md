# UnicomTIC Quiz - Admin

Next.js 14 (App Router) admin console for managing subjects, questions, and exams. Includes a student runner and admin-only results. Now partially wired to a Prisma (SQLite) API.

## Quick Start

1) Install dependencies

```bash
npm install
```

2) Configure database (SQLite via Prisma)

Create a `.env` file in the project root with:

```
DATABASE_URL="file:./dev.db"
```

Generate client and run initial migration:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

3) Run the dev server

```bash
npm run dev
```

Open http://localhost:3000

## Logins (mock)

- Admin: `admin@example.com` / `password`
- Editor: `editor@example.com` / `password`
- Student: `student@example.com` / `password`

Any email starting with `admin`, `editor`, or `student` maps to that role.

## API status

- `/api/questions` (GET/POST) backed by Prisma/SQLite
- Frontend `questionService` calls API and falls back to localStorage mocks if the API/database isn't set up.

## Scripts

- `npm run dev` — start Next.js dev server
- `npm run build` — build
- `npm start` — run production build
- `npm run prisma:generate` — generate Prisma client
- `npm run prisma:migrate` — run dev migration

## Email notifications

Configure SMTP in `.env` to enable real email notifications:

```
SMTP_HOST=smtp.yourhost.com
SMTP_PORT=587
SMTP_USER=your_user
SMTP_PASS=your_pass
FROM_EMAIL="UnicomTIC Quiz <no-reply@yourhost.com>"
```

The Exams page “Notify” action will call `/api/notify` to send emails. If SMTP is not configured, it falls back to a local mock log.
