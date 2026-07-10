# Multi-Store Stock Movement — Backend

Backend API for a multi-store product stock management system. Built with Node.js, Express, and MongoDB. Supports role-based access (Admin / Shopper), concurrency-safe stock adjustments, and atomic stock transfers between stores.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- bcrypt for password hashing

## Prerequisites

- Node.js v18+
- MongoDB running as a **replica set** — required because stock transfers use multi-document transactions, which MongoDB only supports on a replica set (a standalone `mongod` will throw an error).
  - **Local setup:**
```bash
    mongod --replSet rs0 --dbpath <your-db-path>
```
    Then, in a separate terminal:
```bash
    mongosh
    rs.initiate()
```
  - **Or use MongoDB Atlas** — Atlas clusters are replica sets by default, no extra setup needed. Just use your Atlas connection string as `MONGO_URI`.

## Setup & Run

```bash
git clone <this-repo-url>
cd multi-store-stock-backend
npm install
cp .env.example .env
```

Fill in real values in `.env` (see table below).

```bash
npm run dev
```

Server starts at `http://localhost:3002` (or whatever `PORT` you set). Health check:
```bash
curl http://localhost:3002/api/health
```
Expected response: `{"status":"ok"}`

## Environment Variables

`.env.example` is provided in the repo — copy it to `.env` and fill in real values. Never commit `.env`.

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the server listens on | `3002` |
| `MONGO_URI` | MongoDB connection string (must point to a replica set) | `mongodb://localhost:27017/multi-store-stock?replicaSet=rs0` |
| `JWT_SECRET` | Secret used to sign JWTs | (generate a long random string) |
| `JWT_EXPIRATION` | JWT expiry duration | `1d` |
| `CLIENT_URL` | Allowed CORS origin (frontend URL) | `http://localhost:5173` |
| `NODE_ENV` | Environment mode | `development` |

## Seeding the Admin Account

There is no public admin-registration endpoint by design — only `SHOPPER` accounts can be created via the public `/api/auth/register` route. The single admin account is created via a one-time seed script:

```bash
npm run seed:admin
```

This creates an admin with:
- Email: `admin@multistore.com`
- Password: `Admin@123`

Edit `src/scripts/seedAdmin.js` before running if you want different credentials. Running the script again is safe — it checks for an existing admin and skips creation if one already exists.

## Project Structure

src/
config/       # env validation, MongoDB connection
constants/    # role definitions (ADMIN, SHOPPER)
controllers/  # request/response handling
services/     # business logic (auth, products, stores, stock)
models/       # Mongoose schemas (User, Product, Store, Stock)
middleware/   # authenticate, requireAdmin
routes/       # route definitions per resource
scripts/      # admin seed script
utils/        # AppError, JWT helpers


## API Overview

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new shopper account |
| POST | `/api/auth/login` | Public | Login (returns role-bearing JWT) |
| GET | `/api/products` | Any logged-in user | List products |
| POST | `/api/products` | Admin only | Create a product |
| GET | `/api/stores` | Any logged-in user | List stores |
| POST | `/api/stores` | Admin only | Create a store |
| GET | `/api/stock` | Any logged-in user | List stock, optional `?threshold=` low-stock filter |
| POST | `/api/stock/adjust` | Admin only | Adjust stock at one store |
| POST | `/api/stock/transfer` | Admin only | Transfer stock between two stores |

Full request/response schemas are documented in `openapi.yaml` at the repo root — import it into [Swagger Editor](https://editor.swagger.io/) or Postman to explore and test interactively.

## Running Tests

```bash
npm test
```

Covers:
- Concurrent decrement requests never drive stock below zero
- End-to-end transfer correctly decrements source and increments destination
- A transfer exceeding available source stock is rejected

## Error Format

All errors follow a consistent shape:
```json
{
  "error": {
    "message": "Description of what went wrong"
  }
}
```

## Assumptions & Trade-offs

- Public registration always creates a `SHOPPER`; the client cannot self-assign the `ADMIN` role. The one admin account exists only via the seed script.
- Stock documents are created lazily — a `(product, store)` pair has no stock record until an admin first adjusts it, rather than pre-creating zero-quantity rows for every combination.
- Negative-stock prevention is enforced via an atomic MongoDB query (`findOneAndUpdate` with a `quantity: { $gte: amount }` filter), not an application-level read-then-write check.
- Stock transfers use MongoDB multi-document transactions to guarantee all-or-nothing atomicity between the source decrement and destination increment.
- JWT uses a single access token with no refresh-token rotation, as this is outside the assignment's stated scope.