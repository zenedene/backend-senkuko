import productPriceService  from '../services/productPriceService.js';

const getAll = async (req, res) => {
  try {
    const data = await productPriceService.getAllProductPrices();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const data = await productPriceService.getProductPriceById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Product price not found' ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

const getByVariant = async (req, res) => {
  try {
    const data = await productPriceService.getPricesByVariant(req.params.variantId);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Product variant not found' ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const data = await productPriceService.createProductPrice(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const data = await productPriceService.updateProductPrice(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Product price not found' ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await productPriceService.deleteProductPrice(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    const status = err.message === 'Product price not found' ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

export default { getAll, getById, getByVariant, create, update, remove };