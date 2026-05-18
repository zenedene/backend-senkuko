import * as voucherService from '../services/voucherService.js';

const getAll = async (req, res) => {
  try {
    const data = await voucherService.getAllVouchers();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const data = await voucherService.getVoucherById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Voucher not found' ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const data = await voucherService.createVoucher(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const data = await voucherService.updateVoucher(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Voucher not found' ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await voucherService.deleteVoucher(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    const status = err.message === 'Voucher not found' ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

export { getAll, getById, create, update, remove };