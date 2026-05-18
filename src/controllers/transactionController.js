import transactionService from '../services/transactionService.js';

const getAll = async (req, res) => {
  try {
    const data = await transactionService.getAllTransactions();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const data = await transactionService.getTransactionById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Transaction not found' ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const data = await transactionService.createTransaction(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export default{ getAll, getById, create };