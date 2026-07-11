import { HTTP_STATUS } from "../constants/http-status.js";
import { createStore as createStoreService, getAllStores } from "../services/store.service.js";

export const createStore = async (req, res, next) => {
  try {
    const { name } = req.body;
    const store = await createStoreService({ name });
    res.status(HTTP_STATUS.CREATED).json(store);
  } catch (error) {
    next(error);
  }
};

export const listStores = async (req, res, next) => {
  try {
    const stores = await getAllStores();
    res.status(HTTP_STATUS.OK).json(stores);
  } catch (error) {
    next(error);
  }
};