import { v4 as uuidv4 } from "uuid";
import productModel from "../models/productModel.js";
import priceListModel from "../models/priceListModel.js";

const getAllProducts = async () => {
  return await productModel.findAll();
};

const getProductById = async (id) => {
  const product = await productModel.findById(id);
  if (!product) throw new Error("Product not found");
  return product;
};

const getProductWithVariantsAndPrice = async (id, priceListId) => {
  const product = await productModel.findById(id);
  if (!product) throw new Error("Product not found");

  if (!priceListId)
    throw new Error("price_list_id query parameter is required");

  const priceList = await priceListModel.findById(priceListId);
  if (!priceList) throw new Error("Price list not found");
  if (!priceList.is_active) throw new Error("Price list is not active");

  const variants = await productModel.findVariantsByProductIdWithPrice(
    id,
    priceListId,
  );

  const baseVariant =
    variants.find((v) => v.is_base_unit) ?? variants[0] ?? null;
  const total_stock = baseVariant ? Number(baseVariant.stock_qty || 0) : 0;

  return {
    ...product,
    price_list: {
      id: priceList.id,
      name: priceList.name,
      code: priceList.code,
    },
    variants,
    total_stock,
  };
};

const getProductWithVariants = async (id) => {
  const product = await productModel.findById(id);
  if (!product) throw new Error("Product not found");
  const variants = await productModel.findVariantsByProductId(id);

  const baseVariant =
    variants.find((v) => v.is_base_unit) ?? variants[0] ?? null;
  const total_stock = baseVariant ? Number(baseVariant.stock_qty || 0) : 0;

  return { ...product, variants, total_stock };
};

const createProduct = async (data) => {
  if (!data.name) throw new Error("Product name is required");
  if (!data.sku_code) throw new Error("SKU code is required");
  return await productModel.create({ ...data, id: uuidv4() });
};

const updateProduct = async (id, data) => {
  const existing = await productModel.findById(id);
  if (!existing) throw new Error("Product not found");
  return await productModel.update(id, data);
};

const deleteProduct = async (id) => {
  const existing = await productModel.findById(id);
  if (!existing) throw new Error("Product not found");
  const affected = await productModel.remove(id);
  if (!affected) throw new Error("Failed to delete product");
  return { message: "Product deleted successfully" };
};

export default {
  getAllProducts,
  getProductById,
  getProductWithVariants,
  getProductWithVariantsAndPrice,
  createProduct,
  updateProduct,
  deleteProduct,
};
