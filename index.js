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

// Enhanced CORS configuration with your exact URLs
const allowedOrigins = [
  'http://localhost:3000', // Local development
  'https://wscs-finals-frontend.vercel.app', // Production frontend
  'https://wscs-finals-backend.onrender.com' // Your Render backend URL
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check against allowed origins (case sensitive)
    const originAllowed = allowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || 
      origin.startsWith(allowedOrigin.replace('https://', 'http://')) // Account for protocol variations
    );
    
    if (originAllowed) {
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked for origin:', origin);
      console.log('✅ Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware to all routes
app.use(cors(corsOptions));

// Explicitly handle OPTIONS requests for all routes
app.options('*', cors(corsOptions));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/orders", orderRoutes);
app.use("/cart", cartRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    allowedOrigins: allowedOrigins
  });
});

// Enhanced error handling
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS policy: Access denied',
      message: `Origin not allowed. Please use one of: ${allowedOrigins.join(', ')}`,
      yourOrigin: req.get('origin'),
      status: 403
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something broke!',
    status: 500
  });
});

app.listen(process.env.PORT || PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || PORT}`);
  console.log('✅ Allowed CORS origins:', allowedOrigins);
  console.log('🔗 Health check endpoint: /health');
});

module.exports = { app, mongoose };