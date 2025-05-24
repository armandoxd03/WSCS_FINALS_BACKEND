const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is Required']
    },
    cartItems: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: [true, 'Product ID is Required']
            },
            quantity: {
                type: Number,
                required: [true, 'Quantity is Required']
            }
        }
    ]
});

module.exports = mongoose.model('Cart', cartSchema);