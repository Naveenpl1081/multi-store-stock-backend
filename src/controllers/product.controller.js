import { HTTP_STATUS } from "../constants/http-status.js";
import { createProduct as createProductService, getAllProducts } from "../services/product.service.js";

export const createProduct = async (req, res, next) => {
  try {
    const { name, sku } = req.body;
    const product = await createProductService({ name, sku });
    res.status(HTTP_STATUS.CREATED).json(product);
  } catch (error) {
    next(error); 
  }
};

export const listProducts = async (req, res, next) => {
  try {
    const products = await getAllProducts();
    res.status(HTTP_STATUS.OK).json(products);
  } catch (error) {
    next(error);
  }
};