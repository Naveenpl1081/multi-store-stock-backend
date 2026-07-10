# Design Notes — Multi-Store Stock Movement (Backend)

## Data Model

Four collections:

- **User** — `username`, `email` (unique), `password` (bcrypt-hashed), `role` (`ADMIN` | `SHOPPER`, default `SHOPPER`). Public registration (`/api/auth/register`) always creates a `SHOPPER`. The single admin account is created via a one-time seed script, never through a public endpoint — this avoids any client-side privilege escalation.

- **Product** — `name`, `sku` (unique, uppercased). SKU uniqueness is enforced by a unique index at the schema level, not application logic.

- **Store** — `name` (unique).

- **Stock** — `product` (ref), `store` (ref), `quantity`. A compound unique index on `{ product, store }` guarantees at most one stock document per product-per-store pair. `quantity` has a schema-level `min: 0` as a secondary guard, but the actual concurrency-safe enforcement happens at the query level, described below.

Stock is modeled as its own collection rather than embedded in Product or Store, since it's a many-to-many relationship that mutates independently and frequently, and needs its own atomic update operations.

## Preventing Negative Stock Under Concurrency

Both `POST /api/stock/adjust` (negative delta) and the source-side of `POST /api/stock/transfer` use a single atomic `findOneAndUpdate`, where the filter condition and the update are evaluated together by MongoDB as one indivisible operation:

```js
Stock.findOneAndUpdate(
  { product, store, quantity: { $gte: amount } },
  { $inc: { quantity: -amount } },
  { new: true }
);
```

MongoDB guarantees the check-and-write happens atomically per document — there is no window between reading the current quantity and applying the decrement where another request can interleave. If two requests race to decrement the same stock document, MongoDB serializes them: the first succeeds and updates the quantity; the second re-evaluates the filter against the now-updated value. If it no longer satisfies `quantity >= amount`, `findOneAndUpdate` returns `null`, and the request is rejected with `400`. This avoids the classic read-then-write race condition where application code checks stock and writes as two separate steps, leaving a gap for concurrent requests to both pass the check.

This is verified directly in `tests/stock.test.js`, which fires 5 concurrent decrement requests against a stock level that can only satisfy 3 of them, and asserts exactly 3 succeed, 2 are rejected, and final stock never goes negative.

## Atomic Transfers

`POST /api/stock/transfer` must decrement the source and increment the destination together, with no possibility of one succeeding without the other. This is implemented using a MongoDB multi-document transaction via `mongoose.startSession()` and `session.withTransaction()`:

```js
await session.withTransaction(async () => {
  const source = await Stock.findOneAndUpdate(
    { product, store: fromStoreId, quantity: { $gte: qty } },
    { $inc: { quantity: -qty } },
    { new: true, session }
  );
  if (!source) throw new AppError("Insufficient stock at source store", 400);

  const destination = await Stock.findOneAndUpdate(
    { product, store: toStoreId },
    { $inc: { quantity: qty } },
    { new: true, upsert: true, session }
  );
});
```

If any step inside the transaction throws — including the explicit throw when source stock is insufficient — MongoDB rolls back every write made within that session, so a partial transfer can never persist. The operation either fully commits or leaves the database exactly as it was.

**Note:** this requires MongoDB running as a replica set (even a single-node one locally); a standalone `mongod` instance does not support multi-document transactions. See README for setup.

## Validation

Every stock-changing endpoint validates: quantity/delta is a positive number where required, source and destination stores differ on transfer, referenced product/store exist (`404` if not), and sufficient stock exists (`400` if not). All errors return a consistent shape: `{ "error": { "message": "..." } }`, handled by a centralized error middleware.

## Role Enforcement

Every stock-changing route (`/adjust`, `/transfer`, and product/store creation) is protected by two chained middlewares: `authenticate` (verifies the JWT and attaches the decoded `{ id, role }` to the request) followed by `requireAdmin` (rejects with `403` if `role !== "ADMIN"`). Role is never read from the request body or client-supplied data — it comes only from the signed JWT, which itself only ever reflects whatever role was stored on the user's document at login time.