# Exam Munnodi Admin Portal

## Test Coverage

![Lines](./coverage/badges/line.svg)
![Statements](./coverage/badges/statement.svg)
![Functions](./coverage/badges/function.svg)
![Branches](./coverage/badges/branch.svg)

## Prerequisites

- Node.js 18+
- npm 9+

## Environment Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Ensure Prisma has a database connection. The project uses SQLite for local development. Create `.env` with:

   ```bash
   DATABASE_URL="file:./prisma/dev.db"
   ```

   `DATABASE_URL` is required for Prisma CLI commands.

3. Run migrations and seed data:

   ```bash
   npx prisma migrate dev
   node prisma/seed.js
   ```

   The seed script creates:

   - Admin user: `admin@example.com` / `Admin@123`
   - Sample students: pending, approved, and suspended.

4. Start the development server:

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`.

## Authentication & Approval Flow

### Registration (Student)

1. Navigate to `/register` and submit name, email, institution (optional), and password.
2. Registration creates a `Pending` user.
3. User cannot sign in until approved by an admin.

### Admin Approval

1. Sign in as the admin user.
2. Go to `Users & Roles`.
3. Pending users are highlighted and can be `Approve`, `Reject`, or `Suspend` using the table actions.
4. Approving records the admin as the approver and changes status to `Approved`.

### Login

1. Approved user signs in at `/login`.
2. Users with status other than `Approved` see a “pending approval” screen.

### Forgot/Reset Password

1. `/forgot-password` sends a reset token (logged to the server console).
2. `/reset-password?token=...` allows choosing a new password (minimum 8 characters). Token expires after 30 minutes and can be used once.

## Testing Checklist

1. **Registration:** Submit a new student; confirm toast indicates pending approval.
2. **Admin Approval:** Approve the pending student; ensure status badge updates and login succeeds.
3. **Login Enforcement:** Attempt login before approval; verify the “pending approval” message.
4. **Password Reset:** Trigger forgot-password and reset via the logged token.
5. **Role-based Navigation:** Verify students see the limited menu vs admins.

## Useful Scripts

- `npm run dev` – Next.js development server.
- `npm run build` – Production build.
- `npm run start` – Start production server.
- `npm run lint` – Run lint checks.
- `npx prisma studio` – Prisma web UI for inspecting database.

## Deployment

See `docs/DEPLOY.md` for environment variables, build steps, and post-deploy checks.
# UnicomTIC Quiz - Admin
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
- `npm test` — run Jest tests
- `npm run test:watch` — run Jest tests in watch mode
- `npm run test:coverage` — run tests with coverage report
- `npm run test:coverage:report` — generate detailed HTML coverage report
- `npm run test:badges` — generate coverage badges for README
- `npm run test:integration` — run integration tests
- `npm run test:e2e` — run Playwright E2E tests

## Testing & Quality

This project uses a comprehensive testing and quality assurance setup:

- **Jest** - Unit testing framework
- **Testing Library** - React component testing
- **Playwright** - End-to-end testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit checks
- **GitHub Actions** - CI/CD pipeline

Run the test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Generate detailed HTML coverage report
npm run test:coverage:report

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

View the coverage report by opening `coverage/lcov-report/index.html` in your browser or using the provided `coverage-report.html` file.

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

## PostgreSQL Migration & Setup

1) Install PostgreSQL (or Docker Desktop) locally or on your server.

2) Start Postgres with pooling via Docker:

```bash
npm run db:up
```

This launches `postgres` on 5432 and `pgbouncer` on 6432.

3) Create `.env.postgres` based on the provided template, then copy to `.env`:

```bash
copy .env.postgres .env   # Windows
# cp .env.postgres .env   # macOS/Linux
```

4) Switch Prisma to Postgres (non-destructive push for dev):

```bash
npm run prisma:pg:generate
npm run prisma:pg:push
```

5) Seed development data:

```bash
npm run seed
```

6) Run the app:

```bash
npm run dev
```

7) Future schema changes (creates migrations):

```bash
npm run prisma:pg:migrate
```

8) Inspect the database:

```bash
npm run prisma:pg:studio
```

Notes:
- Use the PgBouncer URL for production and high concurrency: `postgresql://user:pass@host:6432/db?schema=public`.
- Unique constraints and indexes are already defined (e.g., `User.email`). Prisma translates them to Postgres.
- For production, prefer a managed Postgres (with pooling) or run `pgbouncer` as provided.
- Set `JWT_SECRET` in your `.env` (required). Tokens default to 15-minute access tokens.
