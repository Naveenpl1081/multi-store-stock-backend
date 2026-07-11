import { HTTP_STATUS } from "../constants/http-status.js";
import AppError from "../utils/AppError.js";
import { validateEmail } from "../utils/validation.util.js";

export const validateRegisterInput = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username?.trim() || !email?.trim() || !password) {
    return next(new AppError("Username, email, and password are required", HTTP_STATUS.BAD_REQUEST));
  }

  if (password.length < 6) {
    return next(new AppError("Password must be at least 6 characters long", HTTP_STATUS.BAD_REQUEST));
  }

  try {
    validateEmail(email.trim());
    next();
  } catch (error) {
    next(error);
  }
};

export const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return next(new AppError("Email and password are required", HTTP_STATUS.BAD_REQUEST));
  }

  next();
};