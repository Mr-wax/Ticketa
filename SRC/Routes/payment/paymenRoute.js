import express from "express";
import { initializePayment, verifyPayment } from "../../Controllers/PaymentController.js";

const router = express.Router();

router.post("/initialize", initializePayment);
router.get("/verify/:reference", verifyPayment);

export default router;
