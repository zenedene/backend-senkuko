import customerService from '../services/customerService.js';

const getAll = async (req, res) => {
  try {
    const data = await customerService.getAllCustomers();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const data = await customerService.getCustomerById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Customer not found' ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const data = await customerService.createCustomer(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const data = await customerService.updateCustomer(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Customer not found' ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await customerService.deleteCustomer(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    const status = err.message === 'Customer not found' ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

export default { getAll, getById, create, update, remove };