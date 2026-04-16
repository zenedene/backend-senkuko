const categoryService = require('../services/categoryService');

const getAll = async (req, res) => {
  try {
    const data = await categoryService.getAllCategories();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const data = await categoryService.getCategoryById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Category not found' ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

const getWithChildren = async (req, res) => {
  try {
    const data = await categoryService.getCategoryWithChildren(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Category not found' ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const data = await categoryService.createCategory(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const data = await categoryService.updateCategory(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Category not found' ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    const status = err.message === 'Category not found' ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getById, getWithChildren, create, update, remove };