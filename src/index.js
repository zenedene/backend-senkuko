require("dotenv").config();
const express = require("express");
const pool = require("./config/database");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const unitRoutes = require("./routes/unitRoutes");
const productVariantRoutes = require("./routes/productVariantRoutes");
const priceListRoutes = require("./routes/priceListRoutes");
const productPriceRoutes = require('./routes/productPriceRoutes');
const customerRoutes = require('./routes/customerRoutes');

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
