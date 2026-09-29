import express from "express"
import { login , logout, updateUserPayment, getUserBilling, deductCredit } from "../controllers/auth.controller.js";

const router = express.Router();

router.post('/login',login)
router.post('/logout',logout)
router.post("/update-plan", updateUserPayment)
router.get("/user/:id", getUserBilling)
router.post("/deduct-credit", deductCredit)


export default router