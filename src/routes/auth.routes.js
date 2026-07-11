import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { validateLoginInput, validateRegisterInput } from "../validations/auht.validation.js";

const router = express.Router();

router.post("/register",validateRegisterInput,register);
router.post("/login",validateLoginInput,login);

export default router;