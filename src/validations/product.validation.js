import { HTTP_STATUS } from "../constants/http-status.js";
import AppError from "../utils/AppError.js";

export const validateCreateProductInput = (req, res, next) => {
  const { name, sku } = req.body;

  if (!name?.trim() || !sku?.trim()) {
    return next(new AppError("Product name and SKU are required", HTTP_STATUS.BAD_REQUEST));
  }

  next();
};