# Labib Tour Management System (LTMS)

Enterprise-grade Travel ERP & Booking Platform. This repository is currently at the **project foundation** stage — architecture, tooling, and scaffolding only. No business logic, authentication, or UI has been implemented yet.

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the reasoning behind key setup decisions.

## Tech Stack

| Layer      | Technology                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------- |
| Frontend   | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, React Router v7, TanStack Query, RHF + Zod |
| Backend    | Node.js, Express, TypeScript, MongoDB (Mongoose), Redis, Socket.IO, JWT                            |
| Deployment | Vercel (client), Railway/Render (server), MongoDB Atlas, Redis Cloud, Cloudinary                   |

## Project Structure

```
labib-tour-management/
├── client/                  # React 19 + Vite frontend
│   ├── src/
│   │   ├── app/              # App shell: providers, router
│   │   ├── components/       # ui/ (shadcn) + common/ (shared) components
│   │   ├── config/            # env access
│   │   ├── features/          # feature-based modules (booking, tours, ...)
│   │   ├── hooks/              # shared custom hooks
│   │   ├── lib/                 # axios instance, cn() utility
│   │   ├── pages/                # route-level page components
│   │   ├── services/              # API call functions per feature
│   │   ├── store/                   # client-side state (if needed beyond Query)
│   │   └── types/                     # shared TS types
│   └── .env.example
├── server/                   # Express + TypeScript backend
│   ├── src/
│   │   ├── config/             # env, database, redis
│   │   ├── middlewares/          # error handler, rate limiter, 404
│   │   ├── modules/                # feature-based modules (auth, tours, bookings, ...)
│   │   ├── routes/                   # route composition root
│   │   ├── sockets/                    # Socket.IO bootstrap
│   │   ├── utils/                        # logger, ApiError
│   │   ├── app.ts                          # Express app factory
│   │   └── server.ts                         # process entry point
│   └── .env.example
└── docs/
    └── ARCHITECTURE.md
```

## Prerequisites

- Node.js **v20+** (see `.nvmrc`)
- npm **v10+**
- A MongoDB Atlas cluster (or local MongoDB instance)
- A Redis instance (Redis Cloud or local)
- A Cloudinary account (for future file-upload features)

## Setup

```bash
# 1. Clone and install all workspace dependencies from the root
git clone <your-repo-url> labib-tour-management
cd labib-tour-management
npm install

# 2. Configure environment variables
cp client/.env.example client/.env
cp server/.env.example server/.env
# Then edit both .env files with real values (Mongo URI, Redis URL, JWT secrets, etc.)

# 3. Enable git hooks (safe to re-run)
npm run prepare
```

### Generating JWT secrets

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run this twice and paste the results into `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in `server/.env`.

## Running in development

```bash
# Run both client (http://localhost:5173) and server (http://localhost:5000) together
npm run dev

# Or run individually
npm run dev:client
npm run dev:server
```

Health check once the server is running: `GET http://localhost:5000/api/v1/health`

## Available Scripts (root)

| Script                 | Description                                   |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`           | Run client + server concurrently               |
| `npm run build`         | Build both client and server for production     |
| `npm run lint`          | Lint both workspaces                            |
| `npm run lint:fix`      | Lint and auto-fix both workspaces                |
| `npm run format`        | Format the entire repo with Prettier              |
| `npm run typecheck`     | Type-check both workspaces with no emit           |

Each workspace (`client`, `server`) also has its own `dev`, `build`, `lint`, and `typecheck` scripts — run with `--workspace=client` / `--workspace=server`, or `cd` into the folder directly.

## Code Quality Tooling

- **ESLint** (flat config, per-workspace) — TypeScript-aware rules, React Hooks + `jsx-a11y` on the client.
- **Prettier** — consistent formatting repo-wide, with `prettier-plugin-tailwindcss` for class sorting.
- **Husky + lint-staged** — runs ESLint/Prettier on staged files before every commit, so bad formatting/lint errors never reach the repo.
- **Path aliases** — import with `@/...` instead of `../../../` on both client and server.

## Git Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): add refresh token rotation
fix(booking): correct date range validation
chore(deps): bump mongoose to 8.9.2
docs(readme): update setup instructions
```

## Current Status

✅ Monorepo, tooling, and folder structure only.
🚧 Authentication, business logic, and UI are **not yet implemented** — they are separate, upcoming phases.

## License

Proprietary — All rights reserved.
