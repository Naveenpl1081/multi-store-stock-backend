import express from "express";
import { authorize } from "../middleware/auth.middleware.js";
import { listStock, adjustStock, transferStock } from "../controllers/stock.controller.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router.get("/", authorize(), listStock);
router.post("/adjust", authorize(ROLES.ADMIN), adjustStock);
router.post("/transfer", authorize(ROLES.ADMIN), transferStock);

export default router;