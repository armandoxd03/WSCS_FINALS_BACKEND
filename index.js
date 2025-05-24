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

const allowedOrigins = [
  'http://localhost:3000',
  'https://wscs-finals-frontend.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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
    allowedOrigins: allowedOrigins
  });
});

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