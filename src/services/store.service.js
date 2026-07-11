import Store from "../models/Store.js";
import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/http-status.js";

export const createStore = async ({ name }) => {
  const sanitizedName = name.trim();

  const existingStore = await Store.findOne({ name: { $regex: new RegExp(`^${sanitizedName}$`, "i") } });
  if (existingStore) {
    throw new AppError(`A store named '${sanitizedName}' already exists`, HTTP_STATUS.CONFLICT);
  }

  return await Store.create({ name: sanitizedName });
};

export const getAllStores = async () => {
  return await Store.find().sort({ createdAt: -1 }).lean();
};