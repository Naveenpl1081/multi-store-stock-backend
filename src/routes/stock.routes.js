import express from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";
import { listStock, adjustStock, transferStock } from "../controllers/stock.controller.js";

const router = express.Router();

router.get("/", authenticate, listStock);
router.post("/adjust", authenticate, requireAdmin, adjustStock);
router.post("/transfer", authenticate, requireAdmin, transferStock);

export default router;