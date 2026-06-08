import { v4 as uuidv4 } from "uuid";
import pool from "../config/database.js";
import transactionModel from "../models/transactionModel.js";
import productVariantModel from "../models/productVariantModel.js";
import productPriceModel from "../models/productPriceModel.js";
import stockLedgerModel from "../models/stockLedgerModel.js";
import customerModel from "../models/customerModel.js";
import { applyPromotions, calculateReward } from "./promotionEngine.js";
import snap from "../config/midtrans.js";

const generateInvoiceNumber = async () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const [rows] = await pool.query(`
    SELECT COUNT(*) AS total FROM transactions
    WHERE DATE(created_at) = CURDATE()
  `);
  const seq = String(rows[0].total + 1).padStart(4, "0");
  return `INV-${dateStr}-${seq}`;
};

/**
 * Validasi semua items: variant exists, price exists, stock cukup
 */
const validateItems = async (items, priceListId) => {
  const validated = [];

  for (const item of items) {
    if (!item.product_variant_id)
      throw new Error("product_variant_id is required for each item");
    if (!item.qty || item.qty <= 0)
      throw new Error("qty must be greater than 0 for each item");

    const variant = await productVariantModel.findById(item.product_variant_id);
    if (!variant)
      throw new Error(`Product variant ${item.product_variant_id} not found`);
    if (!variant.is_active)
      throw new Error(`Product variant ${variant.name} is not active`);
    if (variant.stock_qty < item.qty) {
      throw new Error(
        `Insufficient stock for ${variant.name}. Available: ${variant.stock_qty}, Requested: ${item.qty}`,
      );
    }

    const prices = await productPriceModel.findByVariantId(
      item.product_variant_id,
    );
    const applicablePrice = prices
      .filter(
        (p) =>
          p.price_list_id === priceListId &&
          p.is_active &&
          p.min_qty <= item.qty,
      )
      .sort((a, b) => b.min_qty - a.min_qty)[0];

    if (!applicablePrice) {
      throw new Error(
        `No active price found for variant ${variant.name} in the selected price list`,
      );
    }

    const subtotal = parseFloat(applicablePrice.price) * item.qty;

    validated.push({
      product_variant_id: variant.id,
      product_id: variant.product_id,
      category_id: variant.category_id,
      variant_name: variant.name,
      price_list_id: priceListId,
      price_list_name: applicablePrice.price_list_name,
      qty: item.qty,
      unit_price: parseFloat(applicablePrice.price),
      original_price: parseFloat(applicablePrice.price),
      subtotal,
      stock_qty: variant.stock_qty,
    });
  }

  return validated;
};

const createTransaction = async (data) => {
  const {
    customer_id,
    price_list_id,
    items,
    promo_codes,
    voucher_codes,
    payment_method,
    delivery_address,
    delivery_city,
    delivery_region,
    delivery_subregion,
    delivery_note,
  } = data;

  if (!price_list_id) throw new Error("price_list_id is required");
  if (!items || items.length === 0)
    throw new Error("Transaction must have at least one item");
  if (!payment_method) throw new Error("payment_method is required");

  const VALID_PAYMENT_METHODS = [
    "bank_transfer",
    "qris",
    "gopay",
    "shopeepay",
    "cod",
  ];
  if (!VALID_PAYMENT_METHODS.includes(payment_method)) {
    throw new Error(
      `Invalid payment_method. Valid values: ${VALID_PAYMENT_METHODS.join(", ")}`,
    );
  }

  if (!delivery_address) throw new Error("delivery_address is required");
  if (!delivery_city) throw new Error("delivery_city is required");
  if (!delivery_region) throw new Error("delivery_region is required");

  let customer = null;
  if (customer_id) {
    customer = await customerModel.findById(customer_id);
    if (!customer) throw new Error("Customer not found");
  }

  const validatedItems = await validateItems(items, price_list_id);
  const subtotal = validatedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalQty = validatedItems.reduce((sum, item) => sum + item.qty, 0);

  const context = {
    subtotal,
    totalQty,
    items: validatedItems,
    customerMemberType: customer?.member_type ?? "regular",
  };

  const appliedPromotions = await applyPromotions(
    promo_codes || [],
    voucher_codes || [],
    context,
  );

  let totalDiscount = 0;
  const itemDiscountMap = {};
  const transactionPromos = [];
  const freeItemsToProcess = [];

  for (const { promotion, rewards, voucherId } of appliedPromotions) {
    let promoDiscount = 0;
    const appliedRewards = [];

    for (const reward of rewards) {
      const result = calculateReward(reward, validatedItems, subtotal);
      promoDiscount += result.discountAmount;
      totalDiscount += result.discountAmount;

      for (const itemDiscount of result.itemDiscounts) {
        if (!itemDiscountMap[itemDiscount.variantId]) {
          itemDiscountMap[itemDiscount.variantId] = 0;
        }
        itemDiscountMap[itemDiscount.variantId] += itemDiscount.discount;
      }

      for (const freeItem of result.freeItems) {
        freeItemsToProcess.push({ freeItem, promotionId: promotion.id });
      }

      appliedRewards.push({
        reward_type: reward.reward_type,
        discount_value: reward.discount_value,
        discount_mode: reward.discount_mode,
      });
    }

    transactionPromos.push({
      id: uuidv4(),
      promotion,
      voucherId,
      discountGiven: promoDiscount,
      appliedRewards: JSON.stringify(appliedRewards),
    });
  }

  totalDiscount = Math.min(totalDiscount, subtotal);
  const grandTotal = subtotal - totalDiscount;

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const transactionId = uuidv4();
    const invoiceNumber = await generateInvoiceNumber();
    const midtransOrderId = `ORDER-${invoiceNumber}`;

    // Insert transaksi dengan status pending_payment
    // Insert transaksi
    await conn.query(
      `
      INSERT INTO transactions (
        id, invoice_number, customer_id, status, payment_status,
        subtotal, total_discount, grand_total, paid_amount,
        change_amount, payment_method, midtrans_order_id,
        delivery_address, delivery_city, delivery_region,
        delivery_subregion, delivery_note,
        transacted_at, created_at
      ) VALUES (?, ?, ?, 'pending_payment', 'pending', ?, ?, ?, 0, 0, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `,
      [
        transactionId,
        invoiceNumber,
        customer_id ?? null,
        subtotal,
        totalDiscount,
        grandTotal,
        payment_method,
        midtransOrderId,
        delivery_address,
        delivery_city,
        delivery_region,
        delivery_subregion ?? null,
        delivery_note ?? null,
      ],
    );

    // Insert transaction items
    for (const item of validatedItems) {
      const itemId = uuidv4();
      const itemDiscount = itemDiscountMap[item.product_variant_id] ?? 0;
      const itemSubtotal = item.subtotal - itemDiscount;

      await conn.query(
        `
        INSERT INTO transaction_items (
          id, transaction_id, product_variant_id, price_list_id,
          qty, unit_price, original_price, discount_amount, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          itemId,
          transactionId,
          item.product_variant_id,
          item.price_list_id,
          item.qty,
          item.unit_price,
          item.original_price,
          itemDiscount,
          itemSubtotal,
        ],
      );

      if (itemDiscount > 0) {
        for (const { promotion } of appliedPromotions) {
          await conn.query(
            `
            INSERT INTO transaction_item_promotions (
              id, transaction_item_id, promotion_id, discount_amount, reward_detail
            ) VALUES (?, ?, ?, ?, ?)
          `,
            [
              uuidv4(),
              itemId,
              promotion.id,
              itemDiscount,
              JSON.stringify({ promotion_name: promotion.name }),
            ],
          );
        }
      }
    }

    // Insert transaction promotions
    for (const tp of transactionPromos) {
      await conn.query(
        `
        INSERT INTO transaction_promotions (
          id, transaction_id, promotion_id, voucher_id,
          discount_given, applied_rewards
        ) VALUES (?, ?, ?, ?, ?, ?)
      `,
        [
          tp.id,
          transactionId,
          tp.promotion.id,
          tp.voucherId ?? null,
          tp.discountGiven,
          tp.appliedRewards,
        ],
      );

      await conn.query(
        `
        UPDATE promotions SET usage_count = usage_count + 1 WHERE id = ?
      `,
        [tp.promotion.id],
      );

      if (tp.voucherId) {
        await conn.query(
          `
          UPDATE vouchers SET status = 'used', usage_count = usage_count + 1 WHERE id = ?
        `,
          [tp.voucherId],
        );
      }
    }

    await conn.commit();

    if (payment_method === "cod") {
      return {
        transaction_id: transactionId,
        invoice_number: invoiceNumber,
        grand_total: grandTotal,
        payment_method: "cod",
        status: "pending_payment",
        message: "Order berhasil dibuat. Menunggu konfirmasi admin.",
      };
    }

    // Request Snap Token ke Midtrans
    const midtransPayload = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: Math.round(grandTotal),
      },
      item_details: validatedItems.map((item) => ({
        id: item.product_variant_id,
        price: Math.round(item.unit_price),
        quantity: item.qty,
        name: item.variant_name,
      })),
      customer_details: customer
        ? {
            first_name: customer.name,
            email:
              customer.email && customer.email.trim() !== ""
                ? customer.email
                : undefined,
            phone:
              customer.phone && customer.phone.trim() !== ""
                ? customer.phone
                : undefined,
          }
        : undefined,
      enabled_payments: ["bank_transfer", "gopay", "qris", "shopeepay"],
    };

    const midtransResponse = await snap.createTransaction(midtransPayload);

    await pool.query(
      `
      UPDATE transactions
      SET midtrans_token = ?, midtrans_pdf_url = ?
      WHERE id = ?
    `,
      [midtransResponse.token, midtransResponse.redirect_url, transactionId],
    );

    return {
      transaction_id: transactionId,
      invoice_number: invoiceNumber,
      grand_total: grandTotal,
      snap_token: midtransResponse.token,
      redirect_url: midtransResponse.redirect_url,
    };

    // Simpan snap token ke database
    await pool.query(
      `
      UPDATE transactions
      SET midtrans_token = ?, midtrans_pdf_url = ?
      WHERE id = ?
    `,
      [midtransResponse.token, midtransResponse.redirect_url, transactionId],
    );

    return {
      transaction_id: transactionId,
      invoice_number: invoiceNumber,
      grand_total: grandTotal,
      snap_token: midtransResponse.token,
      redirect_url: midtransResponse.redirect_url,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
const getTransactionById = async (id) => {
  const transaction = await transactionModel.findById(id);
  if (!transaction) throw new Error("Transaction not found");

  const items = await transactionModel.findItemsByTransactionId(id);
  const promotions = await transactionModel.findPromotionsByTransactionId(id);

  const promotionsWithFreeItems = await Promise.all(
    promotions.map(async (tp) => {
      const freeItems =
        await transactionModel.findFreeItemsByTransactionPromotionId(tp.id);
      return { ...tp, free_items: freeItems };
    }),
  );

  return { ...transaction, items, promotions: promotionsWithFreeItems };
};

const getAllTransactions = async () => {
  return await transactionModel.findAll();
};

const handleMidtransWebhook = async (notification) => {
  const { order_id, transaction_status, fraud_status, gross_amount } =
    notification;

  const [rows] = await pool.query(
    `
    SELECT * FROM transactions WHERE midtrans_order_id = ?
  `,
    [order_id],
  );

  const transaction = rows[0];
  if (!transaction) throw new Error("Transaction not found");

  let paymentStatus = "pending";
  let transactionStatus = transaction.status;
  let paidAt = null;

  if (transaction_status === "capture" && fraud_status === "accept") {
    paymentStatus = "paid";
    transactionStatus = "processing";
    paidAt = new Date();
  } else if (transaction_status === "settlement") {
    paymentStatus = "paid";
    transactionStatus = "processing";
    paidAt = new Date();
  } else if (
    transaction_status === "cancel" ||
    transaction_status === "expire"
  ) {
    paymentStatus = transaction_status;
    transactionStatus = "cancelled";
  } else if (transaction_status === "deny") {
    paymentStatus = "failed";
    transactionStatus = "failed";
  }

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    await conn.query(
      `
      UPDATE transactions
      SET payment_status = ?, status = ?,
          paid_amount = ?, paid_at = ?
      WHERE midtrans_order_id = ?
    `,
      [paymentStatus, transactionStatus, gross_amount, paidAt, order_id],
    );

    // Jika pembayaran berhasil, baru kurangi stok
    if (paymentStatus === "paid") {
      const [items] = await conn.query(
        `
        SELECT * FROM transaction_items WHERE transaction_id = ?
      `,
        [transaction.id],
      );

      const stockLedgerEntries = [];

      for (const item of items) {
        const [variantRows] = await conn.query(
          `
          SELECT stock_qty FROM product_variants WHERE id = ?
        `,
          [item.product_variant_id],
        );

        const qtyBefore = variantRows[0].stock_qty;
        const qtyAfter = qtyBefore - item.qty;

        await conn.query(
          `
          UPDATE product_variants SET stock_qty = ? WHERE id = ?
        `,
          [qtyAfter, item.product_variant_id],
        );

        stockLedgerEntries.push([
          uuidv4(),
          item.product_variant_id,
          transaction.id,
          "transaction",
          -item.qty,
          qtyBefore,
          qtyAfter,
          `Sale - ${transaction.invoice_number}`,
          new Date(),
        ]);
      }

      if (stockLedgerEntries.length > 0) {
        await conn.query(
          `
          INSERT INTO stock_ledger (
            id, product_variant_id, reference_id, reference_type,
            qty_change, qty_before, qty_after, note, created_at
          ) VALUES ?
        `,
          [stockLedgerEntries],
        );
      }

      // Update total spend customer
      if (transaction.customer_id) {
        await conn.query(
          `
          UPDATE customers SET total_spend = total_spend + ? WHERE id = ?
        `,
          [gross_amount, transaction.customer_id],
        );
      }
    }

    await conn.commit();
    return { message: "Webhook processed successfully" };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const updateTransactionStatus = async (id, status) => {
  const VALID_STATUSES = [
    "processing",
    "shipped",
    "completed",
    "cancelled",
    "paid",
  ];

  if (!VALID_STATUSES.includes(status)) {
    throw new Error(
      `Invalid status. Valid values: ${VALID_STATUSES.join(", ")}`,
    );
  }

  const transaction = await transactionModel.findById(id);
  if (!transaction) throw new Error("Transaction not found");

  // Jika bukan COD, tidak boleh set paid manual
  if (status === "paid" && transaction.payment_method !== "cod") {
    throw new Error(
      "Manual payment confirmation only allowed for COD transactions",
    );
  }

  // Jika COD dan admin konfirmasi paid, kurangi stok
  if (status === "paid" && transaction.payment_method === "cod") {
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      await conn.query(
        `
        UPDATE transactions
        SET status = 'completed', payment_status = 'paid', paid_at = NOW()
        WHERE id = ?
      `,
        [id],
      );

      const [items] = await conn.query(
        `
        SELECT * FROM transaction_items WHERE transaction_id = ?
      `,
        [id],
      );

      const stockLedgerEntries = [];

      for (const item of items) {
        const [variantRows] = await conn.query(
          `
          SELECT stock_qty FROM product_variants WHERE id = ?
        `,
          [item.product_variant_id],
        );

        const qtyBefore = variantRows[0].stock_qty;
        const qtyAfter = qtyBefore - item.qty;

        await conn.query(
          `
          UPDATE product_variants SET stock_qty = ? WHERE id = ?
        `,
          [qtyAfter, item.product_variant_id],
        );

        stockLedgerEntries.push([
          uuidv4(),
          item.product_variant_id,
          id,
          "transaction",
          -item.qty,
          qtyBefore,
          qtyAfter,
          `COD Sale - ${transaction.invoice_number}`,
          new Date(),
        ]);
      }

      if (stockLedgerEntries.length > 0) {
        await conn.query(
          `
          INSERT INTO stock_ledger (
            id, product_variant_id, reference_id, reference_type,
            qty_change, qty_before, qty_after, note, created_at
          ) VALUES ?
        `,
          [stockLedgerEntries],
        );
      }

      if (transaction.customer_id) {
        await conn.query(
          `
          UPDATE customers SET total_spend = total_spend + ? WHERE id = ?
        `,
          [transaction.grand_total, transaction.customer_id],
        );
      }

      await conn.commit();
      return transactionModel.findById(id);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  // Update status biasa untuk non-COD atau status selain paid
  await pool.query(
    `
    UPDATE transactions SET status = ? WHERE id = ?
  `,
    [status, id],
  );

  return transactionModel.findById(id);
};
export default {
  createTransaction,
  getTransactionById,
  getAllTransactions,
  handleMidtransWebhook,
  updateTransactionStatus,
};
