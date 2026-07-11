import { HTTP_STATUS } from "../constants/http-status.js";
import { getStockList, adjustStock as adjustStockService, transferStock as transferStockService } from "../services/stock.service.js";
import { sendResponse } from "../utils/response.util.js";

export const listStock = async (req, res, next) => {
  try {
    const { threshold } = req.query;
    const stock = await getStockList({ lowStockThreshold: threshold });
    
    return sendResponse(
      res, 
      HTTP_STATUS.OK, 
      "Stock inventory retrieved successfully", 
      stock
    );
  } catch (error) {
    next(error);
  }
};

export const adjustStock = async (req, res, next) => {
  try {
    const { productId, storeId, delta } = req.body;
    const result = await adjustStockService({ productId, storeId, delta });
    
    return sendResponse(
      res, 
      HTTP_STATUS.OK, 
      "Stock adjusted successfully", 
      result
    );
  } catch (error) {
    next(error);
  }
};

export const transferStock = async (req, res, next) => {
  try {
    const { productId, fromStoreId, toStoreId, quantity } = req.body;
    const result = await transferStockService({ productId, fromStoreId, toStoreId, quantity });
    
    return sendResponse(
      res, 
      HTTP_STATUS.OK, 
      "Stock transferred successfully", 
      result
    );
  } catch (error) {
    next(error);
  }
};