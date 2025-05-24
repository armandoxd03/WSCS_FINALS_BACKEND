const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { verify, verifyAdmin } = require("../auth");

// Admin-only routes
router.get("/all", verify, verifyAdmin, productController.getAll);
router.post("/", verify, verifyAdmin, productController.addProduct);
router.patch("/:productId", verify, verifyAdmin, productController.updateProduct);
router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);
router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);
router.delete("/:productId", verify, verifyAdmin, productController.deleteProduct);

// User routes
router.patch('/:productId/like', verify, productController.likeProduct);

// Public routes
router.get("/active", productController.getAllActive);
router.get("/:productId", productController.getProduct);
// Unified search endpoint for name/desc, price, and sorting
router.post("/search", productController.searchProducts);

module.exports = router;