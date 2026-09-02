import { v4 as uuidv4 } from 'uuid';
import voucherModel from '../models/voucherModel.js';
import promotionManagementModel from '../models/promotionManagementModel.js';

const VALID_STATUSES = ['active', 'inactive'];
const VALID_VISIBILITIES = ['public', 'private'];

const getAllVouchers = async () => {
  return await voucherModel.findAll();
};

const getVoucherById = async (id) => {
  const voucher = await voucherModel.findById(id);
  if (!voucher) throw new Error('Voucher not found');
  return voucher;
};

const createVoucher = async (data) => {
  if (!data.promotion_id) throw new Error('promotion_id is required');
  if (!data.code) throw new Error('Voucher code is required');

  if (data.visibility && !VALID_VISIBILITIES.includes(data.visibility)) {
    throw new Error(`Invalid visibility. Valid values: ${VALID_VISIBILITIES.join(', ')}`);
  }

  const promotion = await promotionManagementModel.findById(data.promotion_id);
  if (!promotion) throw new Error('Promotion not found');

  const existing = await voucherModel.findByCode(data.code);
  if (existing) throw new Error('Voucher code already exists');

  return await voucherModel.create({ ...data, id: uuidv4() });
};

const updateVoucher = async (id, data) => {
  const existing = await voucherModel.findById(id);
  if (!existing) throw new Error('Voucher not found');

  if (!data.code) throw new Error('Voucher code is required');

  if (data.status && !VALID_STATUSES.includes(data.status)) {
    throw new Error(`Invalid status. Valid values: ${VALID_STATUSES.join(', ')}`);
  }

  if (data.visibility && !VALID_VISIBILITIES.includes(data.visibility)) {
    throw new Error(`Invalid visibility. Valid values: ${VALID_VISIBILITIES.join(', ')}`);
  }

  if (data.code !== existing.code) {
    const duplicate = await voucherModel.findByCode(data.code);
    if (duplicate) throw new Error('Voucher code already exists');
  }

  return await voucherModel.update(id, data);
};

const deleteVoucher = async (id) => {
  const existing = await voucherModel.findById(id);
  if (!existing) throw new Error('Voucher not found');

  const usage = await voucherModel.countUsage(id);
  if (usage > 0) throw new Error('Cannot delete voucher that has been used in transactions');

  const affected = await voucherModel.remove(id);
  if (!affected) throw new Error('Failed to delete voucher');
  return { message: 'Voucher deleted successfully' };
};

export { getAllVouchers, getVoucherById, createVoucher, updateVoucher, deleteVoucher };