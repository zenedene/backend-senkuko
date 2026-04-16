import { v4 as uuidv4 }  from 'uuid';
import productVariantModel from '../models/productVariantModel.js';
import productModel from '../models/productModel.js';
import unitModel from '../models/unitModel.js';

const getAllVariants = async () => {
  return await productVariantModel.findAll();
};

const getVariantById = async (id) => {
  const variant = await productVariantModel.findById(id);
  if (!variant) throw new Error('Product variant not found');
  return variant;
};

const getVariantsByProduct = async (productId) => {
  const product = await productModel.findById(productId);
  if (!product) throw new Error('Product not found');
  const variants = await productVariantModel.findByProductId(productId);
  return { product, variants };
};

const createVariant = async (data) => {
  if (!data.product_id) throw new Error('Product ID is required');
  if (!data.unit_id) throw new Error('Unit ID is required');
  if (!data.name) throw new Error('Variant name is required');

  const product = await productModel.findById(data.product_id);
  if (!product) throw new Error('Product not found');

  const unit = await unitModel.findById(data.unit_id);
  if (!unit) throw new Error('Unit not found');

  if (data.is_base_unit) {
    const existing = await productVariantModel.findByProductId(data.product_id);
    const alreadyHasBase = existing.some((v) => v.is_base_unit);
    if (alreadyHasBase) throw new Error('Product already has a base unit variant');
  }

  return await productVariantModel.create({ ...data, id: uuidv4() });
};

const updateVariant = async (id, data) => {
  const existing = await productVariantModel.findById(id);
  if (!existing) throw new Error('Product variant not found');

  const unit = await unitModel.findById(data.unit_id);
  if (!unit) throw new Error('Unit not found');

  if (data.is_base_unit && !existing.is_base_unit) {
    const variants = await productVariantModel.findByProductId(existing.product_id);
    const alreadyHasBase = variants.some((v) => v.is_base_unit && v.id !== id);
    if (alreadyHasBase) throw new Error('Product already has a base unit variant');
  }

  return await productVariantModel.update(id, data);
};

const deleteVariant = async (id) => {
  const existing = await productVariantModel.findById(id);
  if (!existing) throw new Error('Product variant not found');

  if (existing.is_base_unit) {
    const total = await productVariantModel.countByProductId(existing.product_id);
    if (total > 1) throw new Error('Cannot delete base unit variant while other variants still exist');
  }

  const affected = await productVariantModel.remove(id);
  if (!affected) throw new Error('Failed to delete product variant');
  return { message: 'Product variant deleted successfully' };
};
export default {
  getAllVariants,
  getVariantById,
  getVariantsByProduct,
  createVariant,
  updateVariant,
  deleteVariant,
};