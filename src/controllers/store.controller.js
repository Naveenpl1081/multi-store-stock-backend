import { createStore as createStoreService, getAllStores } from "../services/store.service.js";

export const createStore = async (req, res, next) => {
  try {
    const { name } = req.body;
    const store = await createStoreService({ name });
    res.status(201).json(store);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: { message: "Store name already exists" },
      });
    }
    next(error);
  }
};

export const listStores = async (req, res, next) => {
  try {
    const stores = await getAllStores();
    res.status(200).json(stores);
  } catch (error) {
    next(error);
  }
};