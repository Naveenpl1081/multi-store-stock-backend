import express from "express";
import { authorize } from "../middleware/auth.middleware.js";
import { createProduct, listProducts } from "../controllers/product.controller.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router.get("/", authorize(), listProducts);
router.post("/", authorize(ROLES.ADMIN), createProduct);

export default router;