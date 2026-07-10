import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";

export const createProduct = async ({ name, sku }) => {
  if (!name || !sku) {
    throw new AppError("Product name and SKU are required", 400);
  }

  const product = await Product.create({
    name: name.trim(),
    sku: sku.trim(),
  });

  return product;
};

export const getAllProducts = async () => {
  const products = await Product.find().sort({ createdAt: -1 });
  return products;
};