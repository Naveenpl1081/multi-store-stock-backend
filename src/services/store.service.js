import Store from "../models/Store.js";
import AppError from "../utils/AppError.js";

export const createStore = async ({ name }) => {
  if (!name) {
    throw new AppError("Store name is required", 400);
  }

  const store = await Store.create({ name: name.trim() });
  return store;
};

export const getAllStores = async () => {
  const stores = await Store.find().sort({ createdAt: -1 });
  return stores;
};