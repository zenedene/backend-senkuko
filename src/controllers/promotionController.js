import * as promotionManagementService from '../services/promotionManagementService.js';

const getAll = async (req, res) => {
  try {
    const data = await promotionManagementService.getAllPromotions();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const data = await promotionManagementService.getPromotionById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Promotion not found' ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const data = await promotionManagementService.createPromotion(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const data = await promotionManagementService.updatePromotion(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Promotion not found' ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await promotionManagementService.deletePromotion(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    const status = err.message === 'Promotion not found' ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

const addCondition = async (req, res) => {
  try {
    const data = await promotionManagementService.addCondition(req.params.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Promotion not found' ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

const deleteCondition = async (req, res) => {
  try {
    const result = await promotionManagementService.removeCondition(req.params.id, req.params.conditionId);
    res.json({ success: true, ...result });
  } catch (err) {
    const status = ['Promotion not found', 'Condition not found'].includes(err.message) ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

const addReward = async (req, res) => {
  try {
    const data = await promotionManagementService.addReward(req.params.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Promotion not found' ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

const deleteReward = async (req, res) => {
  try {
    const result = await promotionManagementService.removeReward(req.params.id, req.params.rewardId);
    res.json({ success: true, ...result });
  } catch (err) {
    const status = ['Promotion not found', 'Reward not found'].includes(err.message) ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

export { getAll, getById, create, update, remove, addCondition, deleteCondition, addReward, deleteReward };