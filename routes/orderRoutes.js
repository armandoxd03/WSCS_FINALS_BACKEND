const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { verify, verifyAdmin } = require("../auth");

// Admin-only routes
router.get("/all-orders", verify, verifyAdmin, orderController.getAllOrders);

// Regular user routes
router.post("/checkout", verify, orderController.checkout);
router.get("/my-orders", verify, orderController.getMyOrders);

module.exports = router;