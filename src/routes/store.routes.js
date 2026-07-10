import express from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";
import { createStore, listStores } from "../controllers/store.controller.js";

const router = express.Router();

router.get("/", authenticate, listStores);
router.post("/", authenticate, requireAdmin, createStore);

export default router;