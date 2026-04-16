import { v4 as uuidv4 }  from 'uuid';
import categoryModel from '../models/categoryModel.js';

const getAllCategories = async () => {
  return await categoryModel.findAll();
};

const getCategoryById = async (id) => {
  const category = await categoryModel.findById(id);
  if (!category) throw new Error('Category not found');
  return category;
};

const getCategoryWithChildren = async (id) => {
  const category = await categoryModel.findById(id);
  if (!category) throw new Error('Category not found');
  const children = await categoryModel.findChildren(id);
  return { ...category, children };
};

const createCategory = async (data) => {
  if (!data.name) throw new Error('Category name is required');
  if (!data.slug) throw new Error('Category slug is required');

  if (data.parent_id) {
    const parent = await categoryModel.findById(data.parent_id);
    if (!parent) throw new Error('Parent category not found');
  }

  return await categoryModel.create({ ...data, id: uuidv4() });
};

const updateCategory = async (id, data) => {
  const existing = await categoryModel.findById(id);
  if (!existing) throw new Error('Category not found');

  if (data.parent_id) {
    if (data.parent_id === id) throw new Error('Category cannot be its own parent');
    const parent = await categoryModel.findById(data.parent_id);
    if (!parent) throw new Error('Parent category not found');
  }

  return await categoryModel.update(id, data);
};

const deleteCategory = async (id) => {
  const existing = await categoryModel.findById(id);
  if (!existing) throw new Error('Category not found');

  const children = await categoryModel.findChildren(id);
  if (children.length > 0) throw new Error('Cannot delete category that has children');

  const usedByProducts = await categoryModel.countProductsByCategory(id);
  if (usedByProducts > 0) throw new Error('Cannot delete category that is still used by products');

  const affected = await categoryModel.remove(id);
  if (!affected) throw new Error('Failed to delete category');
  return { message: 'Category deleted successfully' };
};

export default {
  getAllCategories,
  getCategoryById,
  getCategoryWithChildren,
  createCategory,
  updateCategory,
  deleteCategory,
};