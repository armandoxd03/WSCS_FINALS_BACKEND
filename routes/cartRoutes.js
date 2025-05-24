const express = require("express");
const router = express.Router();
const {verify} = require("../auth");
const cartController = require("../controllers/cartController");

router.get('/',verify,cartController.getCart);
router.post('/addToCart',verify,cartController.addToCart);
router.patch('/updateQuantity',verify,cartController.updateQuantity);
router.put('/clearCart',verify,cartController.clearCart);
router.patch('/:productId/removeFromCart',verify,cartController.removeFromCart);

module.exports = router;