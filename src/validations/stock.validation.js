import { HTTP_STATUS } from "../constants/http-status.js";
import AppError from "../utils/AppError.js";
import { validateObjectId } from "../utils/validation.util.js";

export const validateListStockInput = (req, res, next) => {
  const { threshold } = req.query;

  if (threshold !== undefined) {
    const parsedThreshold = Number(threshold);
    if (Number.isNaN(parsedThreshold) || parsedThreshold < 0) {
      return next(new AppError("Threshold must be a non-negative number", HTTP_STATUS.BAD_REQUEST));
    }
  }
  next();
};

export const validateAdjustStockInput = (req, res, next) => {
  const { productId, storeId, delta } = req.body;

  try {
    validateObjectId(productId, "productId");
    validateObjectId(storeId, "storeId");
  } catch (error) {
    return next(error);
  }

  if (delta === undefined || delta === null || Number.isNaN(Number(delta))) {
    return next(new AppError("Delta is required and must be a number", HTTP_STATUS.BAD_REQUEST));
  }

  if (Number(delta) === 0) {
    return next(new AppError("Delta cannot be zero", HTTP_STATUS.BAD_REQUEST));
  }

  next();
};

export const validateTransferStockInput = (req, res, next) => {
  const { productId, fromStoreId, toStoreId, quantity } = req.body;

  try {
    validateObjectId(productId, "productId");
    validateObjectId(fromStoreId, "fromStoreId");
    validateObjectId(toStoreId, "toStoreId");
  } catch (error) {
    return next(error);
  }

  if (quantity === undefined || quantity === null || Number.isNaN(Number(quantity)) || Number(quantity) <= 0) {
    return next(new AppError("Quantity must be a positive number", HTTP_STATUS.BAD_REQUEST));
  }

  if (fromStoreId === toStoreId) {
    return next(new AppError("Source and destination stores must be different", HTTP_STATUS.BAD_REQUEST));
  }

  next();
};