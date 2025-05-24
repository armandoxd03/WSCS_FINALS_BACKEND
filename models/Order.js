const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  productsOrdered: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      productName: String,
      imageUrl: String,
      description: String,
      price: Number,
      quantity: Number,
      subtotal: Number
    }
  ],
  totalPrice: {
    type: Number,
    required: true
  },
  address: String,
  message: String,
  shippingOption: String,
  paymentMethod: String,
  orderedOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);