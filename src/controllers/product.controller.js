import { createProduct as createProductService, getAllProducts } from "../services/product.service.js";

export const createProduct = async (req, res, next) => {
  try {
    const { name, sku } = req.body;
    const product = await createProductService({ name, sku });
    res.status(201).json(product);
  } catch (error) {
    next(error); 
  }
};

export const listProducts = async (req, res, next) => {
  try {
    const products = await getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};