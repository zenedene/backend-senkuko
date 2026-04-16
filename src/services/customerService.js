const { v4: uuidv4 } = require('uuid');
const customerModel = require('../models/customerModel');

const VALID_MEMBER_TYPES = ['regular', 'member', 'vip'];

const getAllCustomers = async () => {
  return await customerModel.findAll();
};

const getCustomerById = async (id) => {
  const customer = await customerModel.findById(id);
  if (!customer) throw new Error('Customer not found');
  return customer;
};

const createCustomer = async (data) => {
  if (!data.name) throw new Error('Customer name is required');

  if (data.member_type && !VALID_MEMBER_TYPES.includes(data.member_type)) {
    throw new Error(`Invalid member type. Valid values are: ${VALID_MEMBER_TYPES.join(', ')}`);
  }

  if (data.phone) {
    const existingPhone = await customerModel.findByPhone(data.phone);
    if (existingPhone) throw new Error('Phone number already registered');
  }

  if (data.email) {
    const existingEmail = await customerModel.findByEmail(data.email);
    if (existingEmail) throw new Error('Email already registered');
  }

  return await customerModel.create({ ...data, id: uuidv4() });
};

const updateCustomer = async (id, data) => {
  const existing = await customerModel.findById(id);
  if (!existing) throw new Error('Customer not found');

  if (!data.name) throw new Error('Customer name is required');

  if (data.member_type && !VALID_MEMBER_TYPES.includes(data.member_type)) {
    throw new Error(`Invalid member type. Valid values are: ${VALID_MEMBER_TYPES.join(', ')}`);
  }

  if (data.phone && data.phone !== existing.phone) {
    const existingPhone = await customerModel.findByPhone(data.phone);
    if (existingPhone) throw new Error('Phone number already registered');
  }

  if (data.email && data.email !== existing.email) {
    const existingEmail = await customerModel.findByEmail(data.email);
    if (existingEmail) throw new Error('Email already registered');
  }

  return await customerModel.update(id, data);
};

const deleteCustomer = async (id) => {
  const existing = await customerModel.findById(id);
  if (!existing) throw new Error('Customer not found');

  const affected = await customerModel.remove(id);
  if (!affected) throw new Error('Failed to delete customer');
  return { message: 'Customer deleted successfully' };
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};