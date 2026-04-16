const productVariantService = require('../services/productVariantService');

const getAll = async (req, res) => {
  try {
    const data = await productVariantService.getAllVariants();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const data = await productVariantService.getVariantById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Product variant not found' ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

const getByProduct = async (req, res) => {
  try {
    const data = await productVariantService.getVariantsByProduct(req.params.productId);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Product not found' ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const data = await productVariantService.createVariant(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const data = await productVariantService.updateVariant(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Product variant not found' ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await productVariantService.deleteVariant(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    const status = err.message === 'Product variant not found' ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getById, getByProduct, create, update, remove };