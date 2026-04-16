const unitService = require('../services/unitService');

const getAll = async (req, res) => {
  try {
    const data = await unitService.getAllUnits();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const data = await unitService.getUnitById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Unit not found' ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const data = await unitService.createUnit(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const data = await unitService.updateUnit(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Unit not found' ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await unitService.deleteUnit(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    const status = err.message === 'Unit not found' ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };