import { v4 as uuidv4 } from "uuid";
import customerModel from "../models/customerModel.js";

const VALID_STATUSES = ["active", "inactive"];

const getAllCustomers = async () => {
  return await customerModel.findAll();
};

const getCustomerById = async (id) => {
  const customer = await customerModel.findById(id);
  if (!customer) throw new Error("Customer not found");
  return customer;
};

const createCustomer = async (data) => {
  if (!data.name) throw new Error("Customer name is required");

  if (data.phone) {
    const existingPhone = await customerModel.findByPhone(data.phone);
    if (existingPhone) throw new Error("Phone number already registered");
  }

  if (data.email) {
    const existingEmail = await customerModel.findByEmail(data.email);
    if (existingEmail) throw new Error("Email already registered");
  }

  return await customerModel.create({ ...data, id: uuidv4() });
};

const updateCustomer = async (id, data) => {
  const existing = await customerModel.findById(id);
  if (!existing) throw new Error("Customer not found");

  if (!data.name) throw new Error("Customer name is required");

  if (data.phone && data.phone !== existing.phone) {
    const existingPhone = await customerModel.findByPhone(data.phone);
    if (existingPhone) throw new Error("Phone number already registered");
  }

  if (data.email && data.email !== existing.email) {
    const existingEmail = await customerModel.findByEmail(data.email);
    if (existingEmail) throw new Error("Email already registered");
  }

  return await customerModel.update(id, data);
};

const deleteCustomer = async (id) => {
  const existing = await customerModel.findById(id);
  if (!existing) throw new Error("Customer not found");

  const affected = await customerModel.remove(id);
  if (!affected) throw new Error("Failed to delete customer");
  return { message: "Customer deleted successfully" };
};

const updateCustomerStatus = async (id, status) => {
  const existing = await customerModel.findById(id);
  if (!existing) throw new Error("Customer not found");

  if (!status) throw new Error("Status is required");
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(
      `Invalid status. Valid values: ${VALID_STATUSES.join(", ")}`,
    );
  }

  return await customerModel.updateStatus(id, status);
};

const getCustomersByStatus = async (status) => {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(
      `Invalid status. Valid values: ${VALID_STATUSES.join(", ")}`,
    );
  }
  return await customerModel.findByStatus(status);
};

export default {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  updateCustomerStatus,
  getCustomersByStatus,
  deleteCustomer,
};
