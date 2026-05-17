const express = require("express");
const router = express.Router();
const { protect } = require("../Middleware/Jobpostmiddleware");
const { createOrder, verifyPayment, getWorkspacePayments } = require("../Controller/paymentController");

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/workspace/:workspaceId", protect, getWorkspacePayments);

module.exports = router;
