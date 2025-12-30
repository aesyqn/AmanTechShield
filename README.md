

## Getting Started

### 1. Install dependencies (once)

From the project root:

```bash
npm install
npx prisma generate
```

The `npx prisma generate` command makes sure the Prisma Client is generated correctly on a fresh clone so the backend can talk to the database.

### 2. Configure the database (Supabase)

You can either:

- **Each developer uses their own Supabase project**, or
- **Everyone shares a single Supabase project and database** (recommended for group demos).

1. Follow the detailed steps in [backend/README.md](backend/README.md) under "Set up the Supabase database (team options)" to choose your approach.
2. In all cases, you will end up with a `.env` file in the project root that contains at least:
	```env
	DATABASE_URL="postgresql://postgres:YOUR_PASSWORD_OR_SHARED_PASSWORD@db.xxx.supabase.co:5432/postgres"
	BACKEND_PORT=4000
	```
3. You can also copy and edit `.env.example` in the project root as a starting point.

### 3. Run the backend (API + DB)

In one terminal, from the project root:

```bash
npm run backend:dev
```

You should see a message like:

```text
Backend server running on port 4000
```

Quick checks:

- Open `http://localhost:4000/api/health` → should return `{ "status": "ok", "service": "AmanTech backend" }`.
- Open `http://localhost:4000/api/users` → should return `[]` or a list of users from the database.

### 4. Run the frontend (React app)

In another terminal, from the project root:

```bash
npm run dev
```

Then open the URL shown in the terminal (usually `http://localhost:5173`). The frontend will call the backend on `http://localhost:4000` for API requests.

If you need step‑by‑step screenshots and explanations for the backend + Supabase setup, see [backend/README.md](backend/README.md).
