# AmanTech Shield Backend

This folder contains backend placeholders for the 5 main security modules:

1. Penetration Test Simulation – `src/modules/penTest`
2. Advanced Phishing Detection – `src/modules/phishing`
3. Intrusion Detection System (IDS) – `src/modules/ids`
4. Risk Scoring with Islamic Ethics – `src/modules/risk`
5. Recovery & Disclosure Plan – `src/modules/reporting`

Each module has:
- A controller file exporting an Express router.
- A feature-specific README with free/free-tier tool suggestions and API design.

For your group assignment you can implement **only what you need**:
- If you just demo, keep the 501 responses.
- If you add real logic, follow each module README to wire routes, services, and (optionally) a free-tier Postgres DB.

---

## Beginner Guide: Connect Supabase DB & Run

This section is for teammates who are new to Supabase / backend.

### 1. What you need to install

Do this **once** on your laptop:

1. **Node.js** (LTS, version 20+ is fine)
2. **Git** (optional, for cloning the repo)
3. **Code editor** (VS Code or any you like)
4. **Web browser** (Chrome/Edge/Firefox) – to open Supabase and test APIs

Create a free **Supabase** account at https://supabase.com (no install needed, just browser).

### 2. Project files you will touch

- `.env` (in the project root) – holds the database URL
- `prisma/schema.prisma` – defines tables (User, AuditSession, etc.)
- `prisma.config.ts` – tells Prisma where to read `DATABASE_URL`
- `backend/src/prisma.ts` – connects Prisma to the database
- `backend/src/server.ts` – Express server + API routes

You do **not** need to change these files again if they already work – just know they exist.

### 3. Set up the Supabase database

1. Log in to Supabase and create a **new project**.
2. In the project, go to **Database** → **Connection string** (or similar).
3. Copy the **PostgreSQL connection string**. It looks like:
	```
	postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres
	```
4. In the project root, create or edit the `.env` file and add:
	```env
	DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres"
	BACKEND_PORT=4000
	```
	- Replace `YOUR_PASSWORD` and `db.xxx.supabase.co` with your real values from Supabase.
	- Keep the format exactly the same.

> Tip: If your password has special characters like `@`, you can either URL‑encode them or use a simpler password when you create the Supabase project.

### 4. Install dependencies

From the project root (same folder as `package.json`):

```bash
npm install
```

This installs everything for **frontend + backend + Prisma**.

If someone changes the Prisma models later, run:

```bash
npx prisma generate
```

### 5. How the Prisma connection works (simple view)

- `prisma/schema.prisma` says which **provider** we use:
  ```prisma
  datasource db {
	 provider = "postgresql"
  }
  ```
- `prisma.config.ts` reads `DATABASE_URL` from `.env` and gives it to Prisma.
- `backend/src/prisma.ts` uses that URL with a **PostgreSQL adapter**:
  ```ts
  import { PrismaClient } from '@prisma/client';
  import { PrismaPg } from '@prisma/adapter-pg';

  const connectionString = process.env.DATABASE_URL;
  const adapter = new PrismaPg({ connectionString });
  export const prisma = new PrismaClient({ adapter });
  ```

You do **not** need to modify this – just make sure `.env` has a correct `DATABASE_URL`.

### 6. Run the backend server

From the project root:

```bash
npm run backend:dev
```

What you should see in the terminal:

- No red error messages.
- A line similar to:
  ```
  Backend server running on port 4000
  ```

#### 6.1. Test that the backend is running

Open your browser and visit:

1. **Health check** (just checks server):
	- `http://localhost:4000/api/health`
	- Expected JSON:
	  ```json
	  {"status":"ok","service":"AmanTech backend"}
	  ```

2. **Users from database** (checks DB + Prisma):
	- `http://localhost:4000/api/users`
	- If the database is empty: `[]`
	- If there are users: an array of user objects, e.g.
	  ```json
	  [
		 {
			"id": "...",
			"name": "Asyiqin",
			"email": "...",
			"position": "Auditor",
			"createdAt": "2025-12-28T21:56:33.000Z"
		 }
	  ]
	  ```

If `/api/users` returns data (or even an empty `[]`), it means:

- Backend server ✅
- Prisma client ✅
- Supabase DB connection ✅

### 7. Run the frontend and call the backend

1. In another terminal, from the project root, start the frontend:
	```bash
	npm run dev
	```
2. Open the URL shown in the terminal (usually `http://localhost:5173`).

To quickly test from the browser without writing extra code:

1. Open DevTools → **Console**.
2. Run:
	```js
	fetch('http://localhost:4000/api/users')
	  .then(r => r.json())
	  .then(console.log)
	  .catch(console.error);
	```
3. If you see the same users as before, then:
	- Frontend → Backend → Database is all working.

### 8. Common problems & fixes

1. **`DATABASE_URL is not set in the environment`**
	- Check `.env` exists in the **project root**.
	- Make sure it has a line starting with `DATABASE_URL=`.
	- Restart `npm run backend:dev` after you change `.env`.

2. **Backend port already in use**
	- Something else is using port 4000.
	- Either close the other process, or change `BACKEND_PORT` in `.env` and restart.

3. **Cannot connect to database**
	- Check that your Supabase project is still running.
	- Re-copy the connection string from Supabase and update `DATABASE_URL`.
	- Make sure your laptop is online.

If you are stuck, share:

- Screenshot of your `.env` (hide password before sharing publicly).
- The full error message from the terminal when running `npm run backend:dev`.

Then someone from the team can help debug.
