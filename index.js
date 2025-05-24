const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");

const PORT = 4000;

// Add the database connection
mongoose.connect("mongodb+srv://admin:admin123@ua-database.2knwv70.mongodb.net/ecommerceDB?retryWrites=true&w=majority");

mongoose.connection.once('open', () => console.log('Now connected to MongoDB.'));

// Server setup
const app = express();

const allowedOrigins = [
  'http://localhost:3000', // Local development
  'https://wscs-finals-frontend.vercel.app' // Replace with your actual Vercel frontend URL
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Connect routes
app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/orders", orderRoutes);
app.use("/cart", cartRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(process.env.PORT || PORT, () => {
  console.log(`API is now online on port ${process.env.PORT || PORT}`);
});

module.exports = { app, mongoose };