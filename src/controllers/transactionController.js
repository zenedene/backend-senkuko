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

    // Jika customer, pastikan transaksi miliknya sendiri
    if (req.user.role === 'customer' && data.customer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

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

const webhook = async (req, res) => {
  try {
    const result = await transactionService.handleMidtransWebhook(req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const data = await transactionService.updateTransactionStatus(
      req.params.id,
      req.body.status
    );
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Transaction not found' ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

export default { getAll, getById, create, webhook, updateStatus };
