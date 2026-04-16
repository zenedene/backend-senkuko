import { v4 as uuidv4 }  from 'uuid';
import unitModel from '../models/unitModel.js';

const getAllUnits = async () => {
  return await unitModel.findAll();
};

const getUnitById = async (id) => {
  const unit = await unitModel.findById(id);
  if (!unit) throw new Error('Unit not found');
  return unit;
};

const createUnit = async (data) => {
  if (!data.name) throw new Error('Unit name is required');
  if (!data.symbol) throw new Error('Unit symbol is required');
  return await unitModel.create({ ...data, id: uuidv4() });
};

const updateUnit = async (id, data) => {
  const existing = await unitModel.findById(id);
  if (!existing) throw new Error('Unit not found');
  return await unitModel.update(id, data);
};

const deleteUnit = async (id) => {
  const existing = await unitModel.findById(id);
  if (!existing) throw new Error('Unit not found');

  const affected = await unitModel.remove(id);
  if (!affected) throw new Error('Failed to delete unit');
  return { message: 'Unit deleted successfully' };
};

export default{ getAllUnits, getUnitById, createUnit, updateUnit, deleteUnit };