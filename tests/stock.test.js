import request from "supertest";
import app from "../src/app.js";
import Stock from "../src/models/Stock.js";
import {
  createAdminAndToken,
  createProduct,
  createStore,
} from "./helpers.js";

describe("Stock operations", () => {
  test("adjust: never allows stock to go negative under concurrent requests", async () => {
    const { token } = await createAdminAndToken();
    const product = await createProduct();
    const store = await createStore();

    await Stock.create({ product: product._id, store: store._id, quantity: 10 });

    const requests = Array.from({ length: 5 }).map(() =>
      request(app)
        .post("/api/stock/adjust")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: product._id, storeId: store._id, delta: -3 })
    );

    const results = await Promise.all(requests);

    const succeeded = results.filter((r) => r.status === 200);
    const failed = results.filter((r) => r.status === 400);

    expect(succeeded.length).toBe(3);
    expect(failed.length).toBe(2);

    const finalStock = await Stock.findOne({ product: product._id, store: store._id });
    expect(finalStock.quantity).toBeGreaterThanOrEqual(0);
    expect(finalStock.quantity).toBe(1); // 10 - (3*3) = 1
  });

  test("transfer: correctly decrements source and increments destination", async () => {
    const { token } = await createAdminAndToken();
    const product = await createProduct();
    const fromStore = await createStore({ name: "Downtown Branch" });
    const toStore = await createStore({ name: "Airport Branch" });

    await Stock.create({ product: product._id, store: fromStore._id, quantity: 50 });

    const res = await request(app)
      .post("/api/stock/transfer")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: product._id,
        fromStoreId: fromStore._id,
        toStoreId: toStore._id,
        quantity: 20,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.source.quantity).toBe(30);
    expect(res.body.data.destination.quantity).toBe(20);

    const sourceStock = await Stock.findOne({ product: product._id, store: fromStore._id });
    const destStock = await Stock.findOne({ product: product._id, store: toStore._id });
    expect(sourceStock.quantity).toBe(30);
    expect(destStock.quantity).toBe(20);
  });

  test("transfer: rejects a transfer exceeding available source stock", async () => {
    const { token } = await createAdminAndToken();
    const product = await createProduct();
    const fromStore = await createStore({ name: "Downtown Branch" });
    const toStore = await createStore({ name: "Airport Branch" });

    await Stock.create({ product: product._id, store: fromStore._id, quantity: 10 });

    const res = await request(app)
      .post("/api/stock/transfer")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: product._id,
        fromStoreId: fromStore._id,
        toStoreId: toStore._id,
        quantity: 999,
      });

    expect(res.status).toBe(400);

    expect(res.body.error.message).toMatch(/insufficient stock/i);

    const sourceStock = await Stock.findOne({ product: product._id, store: fromStore._id });
    expect(sourceStock.quantity).toBe(10);

    const destStock = await Stock.findOne({ product: product._id, store: toStore._id });
    expect(destStock).toBeNull();
  });

  test("transfer: rejects same-store transfer", async () => {
    const { token } = await createAdminAndToken();
    const product = await createProduct();
    const store = await createStore();

    await Stock.create({ product: product._id, store: store._id, quantity: 10 });

    const res = await request(app)
      .post("/api/stock/transfer")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: product._id,
        fromStoreId: store._id,
        toStoreId: store._id,
        quantity: 5,
      });

    expect(res.status).toBe(400);
  });

  test("stock-changing routes reject non-admin users", async () => {
    const { createShopperAndToken } = await import("./helpers.js");
    const { token } = await createShopperAndToken();
    const product = await createProduct();
    const store = await createStore();

    const res = await request(app)
      .post("/api/stock/adjust")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: product._id, storeId: store._id, delta: 5 });

    expect(res.status).toBe(403);
  });

  test("low-stock filter returns only entries at or below threshold", async () => {
    const { token } = await createAdminAndToken();
    const product = await createProduct();
    const lowStore = await createStore({ name: "Low Store" });
    const highStore = await createStore({ name: "High Store" });

    await Stock.create({ product: product._id, store: lowStore._id, quantity: 3 });
    await Stock.create({ product: product._id, store: highStore._id, quantity: 100 });

    const res = await request(app)
      .get("/api/stock?threshold=10")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].quantity).toBe(3);
  });
});