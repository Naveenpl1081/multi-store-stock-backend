import mongoose from "mongoose";
import Stock from "../models/Stock.js";
import Product from "../models/Product.js";
import Store from "../models/Store.js";
import AppError from "../utils/AppError.js";

export const getStockList = async ({ lowStockThreshold }) => {
  const filter = {};

  if (lowStockThreshold !== undefined) {
    const threshold = Number(lowStockThreshold);
    if (Number.isNaN(threshold) || threshold < 0) {
      throw new AppError("threshold must be a non-negative number", 400);
    }
    filter.quantity = { $lte: threshold };
  }

  const stock = await Stock.find(filter)
    .populate("product", "name sku")
    .populate("store", "name")
    .sort({ updatedAt: -1 });

  return stock;
};

export const adjustStock = async ({ productId, storeId, delta }) => {
  if (delta === undefined || delta === null || Number.isNaN(Number(delta))) {
    throw new AppError("delta is required and must be a number", 400);
  }
  if (Number(delta) === 0) {
    throw new AppError("delta cannot be zero", 400);
  }

  const [product, store] = await Promise.all([
    Product.findById(productId),
    Store.findById(storeId),
  ]);

  if (!product) throw new AppError("Product not found", 404);
  if (!store) throw new AppError("Store not found", 404);

  const numericDelta = Number(delta);

  if (numericDelta > 0) {
    // increasing stock — no negative risk, upsert if the stock doc doesn't exist yet
    const updated = await Stock.findOneAndUpdate(
      { product: productId, store: storeId },
      { $inc: { quantity: numericDelta } },
      { new: true, upsert: true }
    );
    return updated;
  }

  // decreasing stock — must not go below zero, enforced atomically at the query level
  const decrementAmount = Math.abs(numericDelta);

  const updated = await Stock.findOneAndUpdate(
    {
      product: productId,
      store: storeId,
      quantity: { $gte: decrementAmount }, // this condition is checked and applied atomically by MongoDB
    },
    { $inc: { quantity: -decrementAmount } },
    { new: true }
  );

  if (!updated) {
    throw new AppError("Insufficient stock for this adjustment", 400);
  }

  return updated;
};

export const transferStock = async ({ productId, fromStoreId, toStoreId, quantity }) => {
  if (quantity === undefined || quantity === null || Number.isNaN(Number(quantity)) || Number(quantity) <= 0) {
    throw new AppError("quantity must be a positive number", 400);
  }
  if (fromStoreId === toStoreId) {
    throw new AppError("fromStoreId and toStoreId must be different", 400);
  }

  const [product, fromStore, toStore] = await Promise.all([
    Product.findById(productId),
    Store.findById(fromStoreId),
    Store.findById(toStoreId),
  ]);

  if (!product) throw new AppError("Product not found", 404);
  if (!fromStore) throw new AppError("Source store not found", 404);
  if (!toStore) throw new AppError("Destination store not found", 404);

  const qty = Number(quantity);

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      // atomically decrement source, only if it has enough stock
      const source = await Stock.findOneAndUpdate(
        {
          product: productId,
          store: fromStoreId,
          quantity: { $gte: qty },
        },
        { $inc: { quantity: -qty } },
        { new: true, session }
      );

      if (!source) {
        throw new AppError("Insufficient stock at source store", 400);
      }

      // atomically increment destination (upsert if it didn't have this product yet)
      const destination = await Stock.findOneAndUpdate(
        { product: productId, store: toStoreId },
        { $inc: { quantity: qty } },
        { new: true, upsert: true, session }
      );

      result = { source, destination };
    });

    return result;
  } finally {
    await session.endSession();
  }
};