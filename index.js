const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");

const PORT = 4000;

mongoose.connect("mongodb+srv://admin:admin123@ua-database.2knwv70.mongodb.net/ecommerceDB?retryWrites=true&w=majority");
mongoose.connection.once('open', () => console.log('Now connected to MongoDB.'));

const app = express();

// Allow all origins for development/testing
app.use(cors({ origin: true, credentials: true }));
app.options('*', cors({ origin: true, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/orders", orderRoutes);
app.use("/cart", cartRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    message: 'CORS is set to allow all origins (dev mode)'
  });
});

app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something broke!',
    status: 500
  });
});

app.listen(process.env.PORT || PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || PORT}`);
  console.log('🌐 CORS: Allowing all origins (development mode)');
  console.log('🔗 Health check endpoint: /health');
});

module.exports = { app, mongoose };