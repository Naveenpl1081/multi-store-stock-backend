import { HTTP_STATUS } from "../constants/http-status.js";
import { createStore as createStoreService, getAllStores } from "../services/store.service.js";
import { sendResponse } from "../utils/response.util.js";

export const createStore = async (req, res, next) => {
  try {
    const { name } = req.body;
    const store = await createStoreService({ name });
    
    return sendResponse(
      res, 
      HTTP_STATUS.CREATED, 
      "Store created successfully", 
      store
    );
  } catch (error) {
    next(error);
  }
};

export const listStores = async (req, res, next) => {
  try {
    const stores = await getAllStores();
    
    return sendResponse(
      res, 
      HTTP_STATUS.OK, 
      "Stores retrieved successfully", 
      stores
    );
  } catch (error) {
    next(error);
  }
};