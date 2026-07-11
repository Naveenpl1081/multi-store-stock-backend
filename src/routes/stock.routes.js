import express from "express";
import { authorize } from "../middleware/auth.middleware.js";
import { listStock, adjustStock, transferStock } from "../controllers/stock.controller.js";
import { ROLES } from "../constants/roles.js";
import { validateAdjustStockInput, validateListStockInput, validateTransferStockInput } from "../validations/stock.validation.js";

const router = express.Router();

router.get("/", authorize(), validateListStockInput,listStock);
router.post("/adjust", authorize(ROLES.ADMIN), validateAdjustStockInput,adjustStock);
router.post("/transfer", authorize(ROLES.ADMIN),validateTransferStockInput, transferStock);

export default router;