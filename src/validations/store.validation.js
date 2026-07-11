import { HTTP_STATUS } from "../constants/http-status.js";
import AppError from "../utils/AppError.js";

export const validateCreateStoreInput = (req, res, next) => {
  const { name } = req.body;

  if (!name?.trim()) {
    return next(new AppError("Store name is required", HTTP_STATUS.BAD_REQUEST));
  }

  next();
};