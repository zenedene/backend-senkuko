const { v4: uuidv4 } = require('uuid');
const productPriceModel = require('../models/productPriceModel');
const productVariantModel = require('../models/productVariantModel');
const priceListModel = require('../models/priceListModel');

const getAllProductPrices = async () => {
  return await productPriceModel.findAll();
};

const getProductPriceById = async (id) => {
  const price = await productPriceModel.findById(id);
  if (!price) throw new Error('Product price not found');
  return price;
};

const getPricesByVariant = async (variantId) => {
  const variant = await productVariantModel.findById(variantId);
  if (!variant) throw new Error('Product variant not found');
  const prices = await productPriceModel.findByVariantId(variantId);
  return { variant, prices };
};

const createProductPrice = async (data) => {
  if (!data.product_variant_id) throw new Error('Product variant ID is required');
  if (!data.price_list_id) throw new Error('Price list ID is required');
  if (!data.price) throw new Error('Price is required');
  if (data.price <= 0) throw new Error('Price must be greater than 0');

  const variant = await productVariantModel.findById(data.product_variant_id);
  if (!variant) throw new Error('Product variant not found');

  const priceList = await priceListModel.findById(data.price_list_id);
  if (!priceList) throw new Error('Price list not found');

  const duplicate = await productPriceModel.findDuplicate(
    data.product_variant_id,
    data.price_list_id,
    data.min_qty ?? 1
  );
  if (duplicate) throw new Error('Price for this variant, price list, and minimum quantity combination already exists');

  if (data.valid_from && data.valid_to) {
    if (new Date(data.valid_from) >= new Date(data.valid_to)) {
      throw new Error('valid_from must be earlier than valid_to');
    }
  }

  return await productPriceModel.create({ ...data, id: uuidv4() });
};

const updateProductPrice = async (id, data) => {
  const existing = await productPriceModel.findById(id);
  if (!existing) throw new Error('Product price not found');

  if (!data.price) throw new Error('Price is required');
  if (data.price <= 0) throw new Error('Price must be greater than 0');

  const priceList = await priceListModel.findById(data.price_list_id);
  if (!priceList) throw new Error('Price list not found');

  const duplicate = await productPriceModel.findDuplicate(
    existing.product_variant_id,
    data.price_list_id,
    data.min_qty ?? 1,
    id
  );
  if (duplicate) throw new Error('Price for this variant, price list, and minimum quantity combination already exists');

  if (data.valid_from && data.valid_to) {
    if (new Date(data.valid_from) >= new Date(data.valid_to)) {
      throw new Error('valid_from must be earlier than valid_to');
    }
  }

  return await productPriceModel.update(id, data);
};

const deleteProductPrice = async (id) => {
  const existing = await productPriceModel.findById(id);
  if (!existing) throw new Error('Product price not found');

  const total = await productPriceModel.countByVariantId(existing.product_variant_id);
  if (total <= 1) throw new Error('Cannot delete the last remaining price of a variant');

  const affected = await productPriceModel.remove(id);
  if (!affected) throw new Error('Failed to delete product price');
  return { message: 'Product price deleted successfully' };
};

module.exports = {
  getAllProductPrices,
  getProductPriceById,
  getPricesByVariant,
  createProductPrice,
  updateProductPrice,
  deleteProductPrice,
};