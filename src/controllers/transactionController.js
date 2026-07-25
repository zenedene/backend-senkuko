import transactionService from "../services/transactionService.js";
import priceListModel from "../models/priceListModel.js";

const CUSTOMER_GROUP_PRICE_LIST_CODE = {
  GENERAL: "NORMAL",
  MEMBER: "MEMBER",
  GROSIR: "GROSIR",
};

const getPriceListCodeFromCustomerGroup = (customerGroup) => {
  if (!customerGroup) return null;
  const normalized = customerGroup.trim().toUpperCase();
  return CUSTOMER_GROUP_PRICE_LIST_CODE[normalized] ?? normalized;
};

const getAll = async (req, res) => {
  try {
    const data = await transactionService.getAllTransactions();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const data = await transactionService.getCustomerTransactions(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const data = await transactionService.getTransactionById(req.params.id);

    // Jika customer, pastikan transaksi miliknya sendiri
    if (req.user.role === "customer" && data.customer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === "Transaction not found" ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

const normalizePromoPayload = (payload) => {
  const promoCodes = [];
  const voucherCodes = [];

  const pushCodes = (value, target) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === "string" && item.trim()) target.push(item.trim());
        else if (item && typeof item === "object") {
          if (item.code) target.push(String(item.code).trim());
          if (item.value) target.push(String(item.value).trim());
        }
      });
      return;
    }

    if (typeof value === "string" && value.trim()) {
      target.push(value.trim());
      return;
    }

    if (value && typeof value === "object") {
      if (value.code) target.push(String(value.code).trim());
      if (value.value) target.push(String(value.value).trim());
    }
  };

  if (payload.promo_codes) pushCodes(payload.promo_codes, promoCodes);
  if (payload.voucher_codes) pushCodes(payload.voucher_codes, voucherCodes);

  if (payload.promos) pushCodes(payload.promos, promoCodes);
  if (payload.vouchers) pushCodes(payload.vouchers, voucherCodes);

  if (payload.promoCode) promoCodes.push(String(payload.promoCode).trim());
  if (payload.voucherCode)
    voucherCodes.push(String(payload.voucherCode).trim());
  if (payload.promo) promoCodes.push(String(payload.promo).trim());
  if (payload.voucher) voucherCodes.push(String(payload.voucher).trim());

  return { promoCodes, voucherCodes };
};

const create = async (req, res) => {
  try {
    const payload = { ...req.body };
    const { promoCodes, voucherCodes } = normalizePromoPayload(payload);

    payload.promo_codes = promoCodes;
    payload.voucher_codes = voucherCodes;

    if (req.user.role === "customer") {
      payload.customer_id = req.user.id;

      if (!payload.price_list_id && req.user.customer_group) {
        const priceListCode = getPriceListCodeFromCustomerGroup(
          req.user.customer_group,
        );
        const priceList = await priceListModel.findByCode(priceListCode);
        if (priceList) {
          payload.price_list_id = priceList.id;
        }
      }
    }

    const data = await transactionService.createTransaction(payload);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// controllers/transactionController.js
const webhook = async (req, res) => {
  try {
    console.log("========== PROCESSING WEBHOOK ==========");
    console.log("Body:", JSON.stringify(req.body, null, 2));

    // Validasi dasar
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log("Empty webhook body");
      return res.status(400).json({ success: false, message: "Empty body" });
    }

    const { order_id, transaction_status, fraud_status, gross_amount } =
      req.body;

    if (!order_id) {
      console.log("Missing order_id");
      return res
        .status(400)
        .json({ success: false, message: "Missing order_id" });
    }

    console.log(`Processing order: ${order_id}`);
    console.log(`Status: ${transaction_status}, Fraud: ${fraud_status}`);

    const result = await transactionService.handleMidtransWebhook(req.body);

    console.log("Webhook processed successfully");
    return res
      .status(200)
      .json({ success: true, message: "Webhook processed", data: result });
  } catch (err) {
    console.error("Webhook error:", err.message);
    console.error("Stack:", err.stack);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const checkPayment = async (req, res) => {
  try {
    const data = await transactionService.checkAndUpdatePaymentStatus(
      req.params.id,
    );
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === "Transaction not found" ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const data = await transactionService.updateTransactionStatus(
      req.params.id,
      req.body.status,
    );
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === "Transaction not found" ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

const cancelTransaction = async (req, res) => {
  try {
    const data = await transactionService.cancelTransaction(
      req.params.id,
      req.user.id,
    );
    res.json({ success: true, data, message: "Transaction cancelled successfully" });
  } catch (err) {
    let status = 400;
    if (err.message === "Transaction not found") status = 404;
    else if (err.message.startsWith("Forbidden")) status = 403;
    res.status(status).json({ success: false, message: err.message });
  }
};

export default {
  getAll,
  getHistory,
  getById,
  create,
  webhook,
  updateStatus,
  checkPayment,
  cancelTransaction,
};
