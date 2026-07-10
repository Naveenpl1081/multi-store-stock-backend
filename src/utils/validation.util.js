import AppError from "./AppError.js";

export const validateObjectId = (id, fieldName = "ID") => {
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new AppError(`Invalid ${fieldName} format`, 400);
    }
  };

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new AppError("Please provide a valid email address", 400);
  }
};