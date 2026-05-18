import 'dotenv/config';
import express from "express";
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


const app = express();  
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/product-variants", productVariantRoutes);
app.use("/api/price-lists", priceListRoutes);
app.use('/api/product-prices', productPriceRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/vouchers', voucherRoutes);


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

start();
