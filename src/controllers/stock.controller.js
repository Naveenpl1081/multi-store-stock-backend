// controllers/stock.controller.js
import { HTTP_STATUS } from "../constants/http-status.js";
import { getStockList, adjustStock as adjustStockService, transferStock as transferStockService } from "../services/stock.service.js";
import { validateObjectId } from "../utils/validation.util.js";

export const listStock = async (req, res, next) => {
  try {
    const { threshold } = req.query;
    const stock = await getStockList({ lowStockThreshold: threshold });
    res.status(HTTP_STATUS.OK).json(stock);
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req, res, next) => {
  try {
    const { productId, storeId, delta } = req.body;
    
    // Fail fast with clean 400 errors if IDs are malformed
    validateObjectId(productId, "productId");
    validateObjectId(storeId, "storeId");

    const result = await adjustStockService({ productId, storeId, delta });
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const transferStock = async (req, res, next) => {
  try {
    const { productId, fromStoreId, toStoreId, quantity } = req.body;
    
    // Fail fast on bad formats
    validateObjectId(productId, "productId");
    validateObjectId(fromStoreId, "fromStoreId");
    validateObjectId(toStoreId, "toStoreId");

    const result = await transferStockService({ productId, fromStoreId, toStoreId, quantity });
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    next(error);
  }
};