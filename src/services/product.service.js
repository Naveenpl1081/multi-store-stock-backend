import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/http-status.js";

export const createProduct = async ({ name, sku }) => {
  const sanitizedSku = sku.trim().toUpperCase(); 


  const existingProduct = await Product.findOne({ sku: sanitizedSku });
  if (existingProduct) {
    throw new AppError(`Product with SKU '${sanitizedSku}' already exists`, HTTP_STATUS.CONFLICT);
  }

  const product = await Product.create({
    name: name.trim(),
    sku: sanitizedSku,
  });

  return product;
};

export const getAllProducts = async () => {
  return await Product.find().sort({ createdAt: -1 }).lean(); 
  
};