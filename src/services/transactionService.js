import { v4 as uuidv4 } from "uuid";
import pool from "../config/database.js";
import transactionModel from "../models/transactionModel.js";
import productVariantModel from "../models/productVariantModel.js";
import productPriceModel from "../models/productPriceModel.js";
import stockLedgerModel from "../models/stockLedgerModel.js";
import customerModel from "../models/customerModel.js";
import { applyPromotions, calculateReward } from "./promotionEngine.js";
import snap from "../config/midtrans.js";
import midtransClient from "midtrans-client";

const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

const generateInvoiceNumber = async () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const [rows] = await pool.query(`
    SELECT COUNT(*) AS total FROM transactions
    WHERE DATE(created_at) = CURDATE()
  `);
  const seq = String(rows[0].total + 1).padStart(4, "0");
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase(); // tambahan random string
  return `INV-${dateStr}-${seq}-${suffix}`;
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
    preview_only = false,
  } = data;

  if (!price_list_id) throw new Error("price_list_id is required");
  if (!items || items.length === 0)
    throw new Error("Transaction must have at least one item");

  if (!preview_only) {
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
  }

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
  const appliedPromotionSummary = [];

  for (const { promotion, rewards, voucherId, code } of appliedPromotions) {
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

    appliedPromotionSummary.push({
      promotion_id: promotion.id,
      promotion_name: promotion.name,
      promotion_code: promotion.code,
      applied_code: code ?? null,
      discount_type: voucherId ? "voucher" : "promo",
      voucher_id: voucherId ?? null,
      discount_amount: promoDiscount,
      applied_rewards: appliedRewards,
    });

    transactionPromos.push({
      id: uuidv4(),
      promotion,
      voucherId,
      discountGiven: promoDiscount,
      appliedRewards: JSON.stringify(appliedRewards),
    });
  }

  // Process free items: determine the free item's actual unit price for reporting.
  // VALIDASI: Pastikan stock cukup untuk free items agar tidak menjadi minus
  const freeItemsToInsert = [];
  for (const { freeItem, promotionId } of freeItemsToProcess) {
    try {
      // Cek stock free item
      const freeVariant = await productVariantModel.findById(freeItem.variantId);
      if (!freeVariant) {
        console.warn(`Free item variant ${freeItem.variantId} not found`);
        continue;
      }

      // ✅ VALIDASI STOCK: Skip free item jika stock tidak cukup
      if (freeVariant.stock_qty < freeItem.qty) {
        console.warn(
          `Insufficient stock for free item ${freeVariant.name}. Available: ${freeVariant.stock_qty}, Needed: ${freeItem.qty}. Skipping this free item.`,
        );
        continue; // Skip free item ini, jangan tambahkan
      }

      const prices = await productPriceModel.findByVariantId(
        freeItem.variantId,
      );
      const applicablePrice = prices
        .filter(
          (p) =>
            p.price_list_id === price_list_id &&
            p.is_active &&
            p.min_qty <= freeItem.qty,
        )
        .sort((a, b) => b.min_qty - a.min_qty)[0];

      const actualUnitPrice = applicablePrice
        ? parseFloat(applicablePrice.price)
        : 0;

      freeItemsToInsert.push({
        variantId: freeItem.variantId,
        qty: freeItem.qty,
        actualUnitPrice,
        promotionId,
      });
    } catch (e) {
      console.error(
        `Error processing free item ${freeItem.variantId}:`,
        e.message,
      );
      continue; // Skip free item ini jika ada error
    }
  }

  totalDiscount = Math.min(totalDiscount, subtotal);
  const grandTotal = subtotal - totalDiscount;
  const promotionSummary = {
    subtotal,
    total_discount: totalDiscount,
    grand_total: grandTotal,
    applied_promotions: appliedPromotionSummary,
  };

  if (preview_only) {
    return {
      preview_only: true,
      subtotal,
      total_discount: totalDiscount,
      grand_total: grandTotal,
      applied_promotions: appliedPromotionSummary,
      message: "Promo dan voucher berhasil dihitung.",
    };
  }

  // Try full DB transaction several times if invoice_number collision occurs
  const MAX_ATTEMPTS = 10;
  let attempt = 0;
  let lastErr = null;
  let transactionId;
  let invoiceNumber;
  let midtransOrderId;

  while (attempt < MAX_ATTEMPTS) {
    attempt += 1;
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    try {
      transactionId = uuidv4();
      invoiceNumber = await generateInvoiceNumber();
      midtransOrderId = `ORDER-${invoiceNumber}`;

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
            UPDATE vouchers
            SET usage_count = usage_count + 1,
                status = CASE
                  WHEN usage_limit > 0 AND usage_count + 1 >= usage_limit THEN 'used'
                  ELSE status
                END
            WHERE id = ?
          `,
            [tp.voucherId],
          );
        }
      }

      // Insert free items (as transaction items + free_item_rewards + item promotion link)
      for (const freeRow of freeItemsToInsert) {
        const tpObj = transactionPromos.find(
          (t) => t.promotion.id === freeRow.promotionId,
        );
        if (!tpObj) continue;

        const freeItemId = uuidv4();
        const itemSubtotal = 0;
        const itemUnitPrice = freeRow.actualUnitPrice;

        await conn.query(
          `
          INSERT INTO transaction_items (
            id, transaction_id, product_variant_id, price_list_id,
            qty, unit_price, original_price, discount_amount, subtotal
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            freeItemId,
            transactionId,
            freeRow.variantId,
            price_list_id,
            freeRow.qty,
            itemUnitPrice,
            itemUnitPrice,
            0,
            itemSubtotal,
          ],
        );

        // Link item to promotion
        await conn.query(
          `
          INSERT INTO transaction_item_promotions (
            id, transaction_item_id, promotion_id, discount_amount, reward_detail
          ) VALUES (?, ?, ?, ?, ?)
        `,
          [
            uuidv4(),
            freeItemId,
            tpObj.promotion.id,
            0,
            JSON.stringify({
              promotion_name: tpObj.promotion.name,
              type: "free_item",
            }),
          ],
        );

        // Record free_item_rewards for API exposure
        await conn.query(
          `
          INSERT INTO free_item_rewards (id, transaction_promotion_id, product_variant_id, qty, unit_price)
          VALUES (?, ?, ?, ?, ?)
        `,
          [uuidv4(), tpObj.id, freeRow.variantId, freeRow.qty, itemUnitPrice],
        );
      }

      await conn.commit();
      conn.release();
      lastErr = null;
      break; // success
    } catch (err) {
      await conn.rollback();
      conn.release();
      lastErr = err;

      if (
        err &&
        err.code === "ER_DUP_ENTRY" &&
        String(err.message || err.sqlMessage || "").includes("invoice_number")
      ) {
        // Log the duplicate occurrence for observability
        try {
          console.warn(
            `[transaction] Duplicate invoice_number detected (${invoiceNumber}) on attempt ${attempt}. Retrying...`,
          );
        } catch (logErr) {
          // ignore logging failures
        }

        if (attempt >= MAX_ATTEMPTS) {
          console.error(
            `[transaction] Exhausted attempts (${attempt}) generating unique invoice_number. Last invoice tried: ${invoiceNumber}`,
          );
          throw new Error(
            "Failed to generate unique invoice number after multiple attempts",
          );
        }

        // small linear backoff before retrying
        await new Promise((res) => setTimeout(res, 100 * attempt));
        continue;
      }

      throw err;
    }
  }

  if (lastErr) throw lastErr;

  // At this point transaction row and related records inserted.
  if (payment_method === "cod") {
    return {
      transaction_id: transactionId,
      invoice_number: invoiceNumber,
      subtotal,
      total_discount: totalDiscount,
      grand_total: grandTotal,
      payment_method: "cod",
      status: "pending_payment",
      applied_promotions: appliedPromotionSummary,
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
    subtotal,
    total_discount: totalDiscount,
    grand_total: grandTotal,
    applied_promotions: appliedPromotionSummary,
    snap_token: midtransResponse.token,
    redirect_url: midtransResponse.redirect_url,
  };
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

const getCustomerTransactions = async (customerId) => {
  return await transactionModel.findByCustomerId(customerId);
};

const getAllTransactions = async () => {
  return await transactionModel.findAll();
};

const deductStockForTransaction = async (conn, transaction) => {
  const [existingLedgerRows] = await conn.query(
    `SELECT id FROM stock_ledger WHERE reference_id = ? AND reference_type = 'transaction' LIMIT 1`,
    [transaction.id],
  );

  if (existingLedgerRows.length > 0) {
    return false;
  }

  const [items] = await conn.query(
    `SELECT * FROM transaction_items WHERE transaction_id = ?`,
    [transaction.id],
  );

  const stockLedgerEntries = [];

  for (const item of items) {
    const [variantRows] = await conn.query(
      `SELECT stock_qty FROM product_variants WHERE id = ?`,
      [item.product_variant_id],
    );

    if (variantRows.length === 0) continue;

    const qtyBefore = Number(variantRows[0].stock_qty ?? 0);
    const qtyToDeduct = Number(item.qty || 0);

    // ✅ PROTEKSI: Jangan biarkan stock menjadi minus
    // Kurangi stock, tapi pastikan tidak kurang dari 0
    const qtyAfter = Math.max(0, qtyBefore - qtyToDeduct);

    // ⚠️ Jika stock tidak cukup, log warning dan set ke 0
    if (qtyAfter !== qtyBefore - qtyToDeduct) {
      console.warn(
        `Stock insufficient for variant ${item.product_variant_id}. ` +
          `Before: ${qtyBefore}, Needed: ${qtyToDeduct}, After: ${qtyAfter}. ` +
          `Setting to 0 instead of negative.`,
      );
    }

    await conn.query(`UPDATE product_variants SET stock_qty = ? WHERE id = ?`, [
      qtyAfter,
      item.product_variant_id,
    ]);

    stockLedgerEntries.push([
      uuidv4(),
      item.product_variant_id,
      transaction.id,
      "transaction",
      -qtyToDeduct,
      qtyBefore,
      qtyAfter,
      `Sale - ${transaction.invoice_number}`,
      new Date(),
    ]);
  }

  if (stockLedgerEntries.length > 0) {
    await conn.query(
      `INSERT INTO stock_ledger (id, product_variant_id, reference_id, reference_type, qty_change, qty_before, qty_after, note, created_at) VALUES ?`,
      [stockLedgerEntries],
    );
  }

  if (transaction.customer_id) {
    await conn.query(
      `UPDATE customers SET total_spend = total_spend + ? WHERE id = ?`,
      [transaction.grand_total, transaction.customer_id],
    );
  }

  return true;
};

const restoreStockForTransaction = async (conn, transaction) => {
  const [existingLedgerRows] = await conn.query(
    `SELECT id FROM stock_ledger WHERE reference_id = ? AND reference_type = 'transaction_cancel' LIMIT 1`,
    [transaction.id],
  );

  if (existingLedgerRows.length > 0) {
    return false;
  }

  const [items] = await conn.query(
    `SELECT * FROM transaction_items WHERE transaction_id = ?`,
    [transaction.id],
  );

  const stockLedgerEntries = [];

  for (const item of items) {
    const [variantRows] = await conn.query(
      `SELECT stock_qty FROM product_variants WHERE id = ?`,
      [item.product_variant_id],
    );

    if (variantRows.length === 0) continue;

    const qtyBefore = Number(variantRows[0].stock_qty ?? 0);
    const qtyToRestore = Number(item.qty || 0);
    const qtyAfter = qtyBefore + qtyToRestore;

    await conn.query(`UPDATE product_variants SET stock_qty = ? WHERE id = ?`, [
      qtyAfter,
      item.product_variant_id,
    ]);

    stockLedgerEntries.push([
      uuidv4(),
      item.product_variant_id,
      transaction.id,
      "transaction_cancel",
      qtyToRestore,
      qtyBefore,
      qtyAfter,
      `Cancel restore - ${transaction.invoice_number}`,
      new Date(),
    ]);
  }

  if (stockLedgerEntries.length > 0) {
    await conn.query(
      `INSERT INTO stock_ledger (id, product_variant_id, reference_id, reference_type, qty_change, qty_before, qty_after, note, created_at) VALUES ?`,
      [stockLedgerEntries],
    );
  }

  if (transaction.customer_id) {
    await conn.query(
      `UPDATE customers SET total_spend = GREATEST(0, total_spend - ?) WHERE id = ?`,
      [transaction.grand_total, transaction.customer_id],
    );
  }

  const [promoRows] = await conn.query(
    `SELECT * FROM transaction_promotions WHERE transaction_id = ?`,
    [transaction.id],
  );

  for (const tp of promoRows) {
    await conn.query(
      `UPDATE promotions SET usage_count = GREATEST(0, usage_count - 1) WHERE id = ?`,
      [tp.promotion_id],
    );

    if (tp.voucher_id) {
      await conn.query(
        `UPDATE vouchers SET usage_count = GREATEST(0, usage_count - 1), status = 'active' WHERE id = ?`,
        [tp.voucher_id],
      );
    }
  }

  return true;
};

const cancelTransaction = async (transactionId, customerId) => {
  const transaction = await transactionModel.findById(transactionId);
  if (!transaction) throw new Error("Transaction not found");

  if (transaction.customer_id !== customerId) {
    throw new Error("Forbidden: This transaction does not belong to you");
  }

  if (transaction.status !== "pending_payment") {
    throw new Error(
      "Only transactions with status pending_payment can be cancelled",
    );
  }

  if (transaction.payment_status !== "pending") {
    throw new Error(
      "Only transactions with pending payment status can be cancelled",
    );
  }

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    await conn.query(
      `UPDATE transactions SET status = 'cancelled', payment_status = 'cancelled' WHERE id = ?`,
      [transactionId],
    );

    await restoreStockForTransaction(conn, transaction);

    await conn.commit();
    return await transactionModel.findById(transactionId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// services/transactionService.js
const handleMidtransWebhook = async (notification) => {
  try {
    const { order_id, transaction_status, fraud_status, gross_amount } =
      notification;

    console.log("Processing webhook for order:", order_id);
    console.log("Transaction status:", transaction_status);
    console.log("Fraud status:", fraud_status);
    console.log("Gross amount:", gross_amount);

    const [rows] = await pool.query(
      `SELECT * FROM transactions WHERE midtrans_order_id = ?`,
      [order_id],
    );

    const transaction = rows[0];
    if (!transaction) {
      console.error("Transaction not found for order_id:", order_id);
      throw new Error("Transaction not found");
    }

    console.log("Found transaction:", transaction.invoice_number);

    let paymentStatus = "pending";
    let transactionStatus = transaction.status;
    let paidAt = null;

    // ✅ PERBAIKAN: Tambahkan lebih banyak status mapping
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
    } else if (transaction_status === "pending") {
      paymentStatus = "pending";
      transactionStatus = "pending_payment";
    }

    console.log("Updating status to:", { paymentStatus, transactionStatus });

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      await conn.query(
        `UPDATE transactions SET payment_status = ?, status = ?, paid_amount = ?, paid_at = ? WHERE midtrans_order_id = ?`,
        [
          paymentStatus,
          transactionStatus,
          gross_amount || transaction.grand_total,
          paidAt,
          order_id,
        ],
      );

      const shouldDeductStock =
        paymentStatus === "paid" ||
        (transaction.payment_method === "cod" &&
          ["processing", "shipped", "completed", "paid"].includes(
            transactionStatus,
          ));

      if (shouldDeductStock) {
        console.log("Updating stock for completed transaction...");
        await deductStockForTransaction(conn, transaction);
      }

      await conn.commit();
      console.log("Transaction updated successfully:", order_id);

      return {
        message: "Webhook processed successfully",
        transaction_id: transaction.id,
      };
    } catch (err) {
      await conn.rollback();
      console.error("Database error:", err);
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    throw err;
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

  const shouldMarkPaid =
    transaction.payment_method === "cod" &&
    ["processing", "shipped", "completed", "paid"].includes(status);

  const shouldDeductStock =
    shouldMarkPaid ||
    (transaction.payment_status === "paid" &&
      ["processing", "shipped", "completed", "paid"].includes(status));

  const finalStatus = status === "paid" ? "completed" : status;
  const finalPaymentStatus = shouldMarkPaid
    ? "paid"
    : transaction.payment_status;

  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    await conn.query(
      `
      UPDATE transactions
      SET status = ?, payment_status = ?, paid_at = ?
      WHERE id = ?
    `,
      [
        finalStatus,
        finalPaymentStatus,
        finalPaymentStatus === "paid" ? new Date() : null,
        id,
      ],
    );

    if (shouldDeductStock) {
      await deductStockForTransaction(conn, {
        ...transaction,
        status: finalStatus,
        payment_status: finalPaymentStatus,
      });
    }

    await conn.commit();
    return transactionModel.findById(id);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const checkAndUpdatePaymentStatus = async (transactionId) => {
  const transaction = await transactionModel.findById(transactionId);
  if (!transaction) throw new Error("Transaction not found");

  // Kalau sudah paid, return langsung tanpa cek Midtrans
  if (transaction.payment_status === "paid") return transaction;

  // Kalau COD atau tidak ada midtrans_order_id, skip
  if (!transaction.midtrans_order_id || transaction.payment_method === "cod") {
    return transaction;
  }

  try {
    // Cek status langsung ke Midtrans
    const midtransStatus = await coreApi.transaction.status(
      transaction.midtrans_order_id,
    );

    console.log("Midtrans status response:", midtransStatus);

    const { transaction_status, fraud_status, gross_amount } = midtransStatus;

    // Kalau settlement atau capture, proses seperti webhook
    if (
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept")
    ) {
      await handleMidtransWebhook({
        order_id: transaction.midtrans_order_id,
        transaction_status,
        fraud_status,
        gross_amount,
      });

      // Return data terbaru
      return await transactionModel.findById(transactionId);
    }

    if (transaction_status === "cancel" || transaction_status === "expire") {
      await pool.query(
        `UPDATE transactions SET payment_status = ?, status = 'cancelled' WHERE id = ?`,
        [transaction_status, transactionId],
      );
      return await transactionModel.findById(transactionId);
    }
  } catch (err) {
    console.error("Midtrans status check error:", err.message);
    // Jangan throw — return status dari DB saja
  }

  return transaction;
};

export default {
  createTransaction,
  getTransactionById,
  getCustomerTransactions,
  getAllTransactions,
  handleMidtransWebhook,
  updateTransactionStatus,
  checkAndUpdatePaymentStatus,
  cancelTransaction,
};
