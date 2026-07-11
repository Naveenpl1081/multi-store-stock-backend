import express from "express";
import {  authorize } from "../middleware/auth.middleware.js";
import { createStore, listStores } from "../controllers/store.controller.js";
import { ROLES } from "../constants/roles.js";
import { validateCreateStoreInput } from "../validations/store.validation.js";

const router = express.Router();

router.get("/", authorize(), listStores);
router.post("/", authorize(ROLES.ADMIN),validateCreateStoreInput,createStore);

export default router;