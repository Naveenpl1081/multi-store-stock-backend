import express from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";
import { createProduct, listProducts } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", authenticate, listProducts);
router.post("/", authenticate, requireAdmin, createProduct);

export default router;