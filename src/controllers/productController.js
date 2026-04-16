const productService = require('../services/productService');

const getAll = async (req, res) => {
  try {
    const data = await productService.getAllProducts();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const data = await productService.getProductById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Product not found' ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

const getWithVariants = async (req, res) => {
  try {
    const data = await productService.getProductWithVariants(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Product not found' ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const data = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const data = await productService.updateProduct(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Product not found' ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    const status = err.message === 'Product not found' ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getById, getWithVariants, create, update, remove };