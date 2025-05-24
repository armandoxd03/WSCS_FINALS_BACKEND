const Product = require("../models/Product");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");

// Checkout and create an order with full details, removing only checked out items from cart
module.exports.checkout = async (req, res) => {
  try {
    const { productIds, address, message, shippingOption, paymentMethod } = req.body;
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).send({ error: "No products selected for checkout" });
    }

    // Find cart and populate product details
    const cart = await Cart.findOne({ userId: req.user.id }).populate('cartItems.productId');
    if (!cart || cart.cartItems.length < 1) {
      return res.status(404).send({ error: "No Items to Checkout" });
    }

    // Build productsOrdered array from selected products only
    let productsOrdered = [];
    let totalPrice = 0;

    for (const item of cart.cartItems) {
      if (productIds.includes(item.productId._id.toString())) {
        const product = item.productId;
        if (!product) continue;
        const price = product.price;
        const subtotal = price * item.quantity;
        productsOrdered.push({
          productId: product._id,
          productName: product.name,
          imageUrl: product.imageUrl,
          description: product.description,
          price,
          quantity: item.quantity,
          subtotal
        });
        totalPrice += subtotal;
      }
    }

    if (productsOrdered.length < 1) {
      return res.status(404).send({ error: "No valid items to checkout" });
    }

    const newOrder = new Order({
      userId: req.user.id,
      productsOrdered,
      totalPrice,
      address,
      message,
      shippingOption,
      paymentMethod,
      orderedOn: new Date()
    });

    // Remove only checked out items from cart
    cart.cartItems = cart.cartItems.filter(
      item => !productIds.includes(item.productId._id.toString())
    );
    await cart.save();

    await newOrder.save();

    res.status(201).send(true);
  } catch (err) {
    res.status(500).send({ error: "Internal Server Error", details: err });
  }
};

// Get orders for current user
module.exports.getMyOrders = (req, res) => {
    return Order.find({userId: req.user.id})
    .then(orders => {
        if(orders.length > 0){
            return res.status(200).send({ orders });
        } else {
            return res.status(200).send({ orders: [] });
        }
    })
    .catch(err => {
        console.error('Error fetching orders:', err);
        res.status(500).send({ 
            message: "Error fetching orders",
            orders: [] 
        });
    });  
};

// Get all orders (admin) -- UPDATED TO INCLUDE USER INFO
module.exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    const userIds = [...new Set(orders.map(order => order.userId))];
    const users = await User.find({ _id: { $in: userIds } }, "firstName lastName email");
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      };
    });
    const ordersWithUser = orders.map(order => ({
      ...order._doc,
      user: userMap[order.userId] || null
    }));
    return res.status(200).send({ orders: ordersWithUser });
  } catch (err) {
    res.status(500).send({ message: "Error in Find", details: err });
  }
}