import { v4 as uuidv4 }  from 'uuid';
import priceListModel from '../models/priceListModel.js';

const getAllPriceLists = async () => {
  return await priceListModel.findAll();
};

const getPriceListById = async (id) => {
  const priceList = await priceListModel.findById(id);
  if (!priceList) throw new Error('Price list not found');
  return priceList;
};

const createPriceList = async (data) => {
  if (!data.name) throw new Error('Price list name is required');
  if (!data.code) throw new Error('Price list code is required');

  const existing = await priceListModel.findByCode(data.code);
  if (existing) throw new Error('Price list code already exists');

  return await priceListModel.create({ ...data, id: uuidv4() });
};

const updatePriceList = async (id, data) => {
  const existing = await priceListModel.findById(id);
  if (!existing) throw new Error('Price list not found');

  if (data.code && data.code !== existing.code) {
    const duplicate = await priceListModel.findByCode(data.code);
    if (duplicate) throw new Error('Price list code already exists');
  }

  return await priceListModel.update(id, data);
};

const deletePriceList = async (id) => {
  const existing = await priceListModel.findById(id);
  if (!existing) throw new Error('Price list not found');

  const usage = await priceListModel.countUsageByPriceList(id);
  if (usage > 0) throw new Error('Cannot delete price list that is still used by product prices');

  const affected = await priceListModel.remove(id);
  if (!affected) throw new Error('Failed to delete price list');
  return { message: 'Price list deleted successfully' };
};

export default {
  getAllPriceLists,
  getPriceListById,
  createPriceList,
  updatePriceList,
  deletePriceList,
};