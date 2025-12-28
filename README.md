

## Getting Started

### 1. Install dependencies (once)

From the project root:

```bash
npm install
```

### 2. Configure the database (Supabase)

1. Create a free Supabase project.
2. Copy the **PostgreSQL connection string** from Supabase.
3. In the project root, create a `.env` file and add:
	```env
	DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres"
	BACKEND_PORT=4000
	```
	Replace with the real values from Supabase. For more detail, see the backend guide in [backend/README.md](backend/README.md).

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
