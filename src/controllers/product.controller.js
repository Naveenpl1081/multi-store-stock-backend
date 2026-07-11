import { HTTP_STATUS } from "../constants/http-status.js";
import { createProduct as createProductService, getAllProducts } from "../services/product.service.js";
import { sendResponse } from "../utils/response.util.js";

export const createProduct = async (req, res, next) => {
  try {
    const { name, sku } = req.body;
    const product = await createProductService({ name, sku });

    return sendResponse(
      res,
      HTTP_STATUS.CREATED,
      "Product created successfully",
      product
    );
  } catch (error) {
    next(error);
  }
};

export const listProducts = async (req, res, next) => {
  try {
    const products = await getAllProducts();

    return sendResponse(
      res,
      HTTP_STATUS.OK,
      "Products retrieved successfully",
      products
    );
  } catch (error) {
    next(error);
  }
};