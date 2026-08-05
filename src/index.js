import 'dotenv/config';
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import pool from "./config/database.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import unitRoutes from "./routes/unitRoutes.js";
import productVariantRoutes from "./routes/productVariantRoutes.js";
import priceListRoutes from "./routes/priceListRoutes.js";
import productPriceRoutes from './routes/productPriceRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import promotionRoutes from './routes/promotionRoutes.js';
import voucherRoutes from './routes/voucherRoutes.js';
import authRoutes from './routes/authRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';

const app = express();  
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));

// CORS whitelist (replace with your frontend origin)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
  }),
);

// Rate limiter for auth routes (10 requests per minute per IP)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many requests, try again later" },
});
app.use("/api/auth", authLimiter);


app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/product-variants", productVariantRoutes);
app.use("/api/price-lists", priceListRoutes);
app.use('/api/product-prices', productPriceRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/vouchers', voucherRoutes);
// Global error handler (no stack trace in production)
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const response = { success: false, message: err.message || 'Internal Server Error' };
  // In development, include stack for debugging
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }
  res.status(status).json(response);
});

async function testConnection() {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    console.log("Database connected:", rows[0].result);
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
}

async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  start();
}

