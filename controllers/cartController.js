const Cart = require("../models/Cart");

// GET cart - returns cart items with full product info (for remote image URLs)
module.exports.getCart = (req, res) => {
    Cart.findOne({ userId: req.user.id })
        .populate('cartItems.productId')
        .then(cart => {
            if (!cart) return res.status(200).send({ cartItems: [] });

            const cartItems = cart.cartItems.map(item => ({
                productId: item.productId._id,
                productName: item.productId.name,
                imageUrl: item.productId.imageUrl || "/placeholder.png",
                description: item.productId.description,
                price: item.productId.price,
                quantity: item.quantity,
            }));
            res.status(200).send({ cartItems });
        })
        .catch(err => {
            console.error('Error fetching cart:', err);
            res.status(500).send({ error: 'Internal Server Error', cartItems: [] });
        });
};

// Add to cart
module.exports.addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    if (!productId || !quantity || quantity < 1) return res.status(400).json({ error: "Invalid data" });

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
        cart = new Cart({ userId: req.user.id, cartItems: [] });
    }
    const idx = cart.cartItems.findIndex(i => i.productId.equals(productId));
    if (idx > -1) {
        cart.cartItems[idx].quantity += quantity;
    } else {
        cart.cartItems.push({ productId, quantity });
    }
    await cart.save();
    res.status(200).json({ message: "Added to cart" });
};

// Remove from cart
module.exports.removeFromCart = async (req, res) => {
    const { productId } = req.params;
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.cartItems = cart.cartItems.filter(i => !i.productId.equals(productId));
    await cart.save();
    res.status(200).json({ message: "Removed from cart" });
};

// Update quantity
module.exports.updateQuantity = async (req, res) => {
    const { productId, newQuantity } = req.body;
    if (!productId || !newQuantity || newQuantity < 1) return res.status(400).json({ error: "Invalid data" });

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const idx = cart.cartItems.findIndex(i => i.productId.equals(productId));
    if (idx > -1) {
        cart.cartItems[idx].quantity = newQuantity;
        await cart.save();
        return res.status(200).json({ message: "Quantity updated" });
    }
    res.status(404).json({ error: "Product not found in cart" });
};

// Clear cart
module.exports.clearCart = async (req, res) => {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (cart) {
        cart.cartItems = [];
        await cart.save();
    }
    res.status(200).json({ message: "Cart cleared" });
};