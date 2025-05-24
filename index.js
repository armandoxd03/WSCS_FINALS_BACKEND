const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");

const PORT = 4000;

// Database connection
mongoose.connect("mongodb+srv://admin:admin123@ua-database.2knwv70.mongodb.net/ecommerceDB?retryWrites=true&w=majority");

mongoose.connection.once('open', () => console.log('Now connected to MongoDB.'));

// Server setup
const app = express();

// Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://wscs-finals-frontend.vercel.app', 
  'https://wscs-finals-backend.onrender.com'
];

const corsOptions = {
  origin: function (origin, callback) {

    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], 
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

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
  
  // Handle CORS errors specifically
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS policy: Access denied',
      allowedOrigins: allowedOrigins
    });
  }
  
  res.status(500).send('Something broke!');
});

app.listen(process.env.PORT || PORT, () => {
  console.log(`API is now online on port ${process.env.PORT || PORT}`);
  console.log(`Allowed CORS origins:`, allowedOrigins);
});

module.exports = { app, mongoose };