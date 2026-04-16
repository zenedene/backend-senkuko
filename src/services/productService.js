const { v4: uuidv4 } = require('uuid');
const productModel = require('../models/productModel');

const getAllProducts = async () => {
  return await productModel.findAll();
};

const getProductById = async (id) => {
  const product = await productModel.findById(id);
  if (!product) throw new Error('Product not found');
  return product;
};

const getProductWithVariants = async (id) => {
  const product = await productModel.findById(id);
  if (!product) throw new Error('Product not found');
  const variants = await productModel.findVariantsByProductId(id);
  return { ...product, variants };
};

const createProduct = async (data) => {
  if (!data.name) throw new Error('Product name is required');
  if (!data.sku_code) throw new Error('SKU code is required');
  return await productModel.create({ ...data, id: uuidv4() });
};

const updateProduct = async (id, data) => {
  const existing = await productModel.findById(id);
  if (!existing) throw new Error('Product not found');
  return await productModel.update(id, data);
};

const deleteProduct = async (id) => {
  const existing = await productModel.findById(id);
  if (!existing) throw new Error('Product not found');
  const affected = await productModel.remove(id);
  if (!affected) throw new Error('Failed to delete product');
  return { message: 'Product deleted successfully' };
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductWithVariants,
  createProduct,
  updateProduct,
  deleteProduct,
};