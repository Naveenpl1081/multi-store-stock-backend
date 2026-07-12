import mongoose from "mongoose";
import Stock from "../models/Stock.js";
import Product from "../models/Product.js";
import Store from "../models/Store.js";
import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/http-status.js";

export const getStockList = async ({ lowStockThreshold }) => {
  const filter = {};

  if (lowStockThreshold !== undefined) {
    filter.quantity = { $lte: Number(lowStockThreshold) };
  }

  return await Stock.find(filter)
    .populate("product", "name sku")
    .populate("store", "name")
    .sort({ updatedAt: -1 })
    .lean();
};

export const adjustStock = async ({ productId, storeId, delta }) => {

  const [product, store] = await Promise.all([
    Product.findById(productId),
    Store.findById(storeId),
  ]);

  if (!product) throw new AppError("Product not found", HTTP_STATUS.NOT_FOUND);
  if (!store) throw new AppError("Store not found", HTTP_STATUS.NOT_FOUND);

  const numericDelta = Number(delta);

 
  if (numericDelta > 0) {
    return await Stock.findOneAndUpdate(
      { product: productId, store: storeId },
      { $inc: { quantity: numericDelta } },
      { returnDocument: 'after', upsert: true }
    );
  }

  const decrementAmount = Math.abs(numericDelta);

  const stockExists = await Stock.findOne({ product: productId, store: storeId });
  if (!stockExists || stockExists.quantity < decrementAmount) {
    throw new AppError(
      !stockExists 
        ? "No stock record exists for this product at the specified store." 
        : `Insufficient stock. Available: ${stockExists.quantity}, requested reduction: ${decrementAmount}`, 
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  const updated = await Stock.findOneAndUpdate(
    {
      product: productId,
      store: storeId,
      quantity: { $gte: decrementAmount },
    },
    { $inc: { quantity: -decrementAmount } },
    { returnDocument: 'after' }
  );

  if (!updated) {
    throw new AppError("Insufficient stock available for this reduction", HTTP_STATUS.BAD_REQUEST);
  }

  return updated;
};

export const transferStock = async ({ productId, fromStoreId, toStoreId, quantity }) => {
  const [product, fromStore, toStore] = await Promise.all([
    Product.findById(productId),
    Store.findById(fromStoreId),
    Store.findById(toStoreId),
  ]);

  if (!product) throw new AppError("Product not found", HTTP_STATUS.NOT_FOUND);
  if (!fromStore) throw new AppError("Source store not found", HTTP_STATUS.NOT_FOUND);
  if (!toStore) throw new AppError("Destination store not found", HTTP_STATUS.NOT_FOUND);

  const qty = Number(quantity);
  const session = await mongoose.startSession();
  
  try {
    let result;
    await session.withTransaction(async () => {
 
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
        throw new AppError("Insufficient stock at source store to fulfill transfer", HTTP_STATUS.BAD_REQUEST);
      }


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