import { v4 as uuidv4 } from "uuid";
import pool from "../config/database.js";
import transactionModel from "../models/transactionModel.js";
import productVariantModel from "../models/productVariantModel.js";
import productPriceModel from "../models/productPriceModel.js";
import stockLedgerModel from "../models/stockLedgerModel.js";
import customerModel from "../models/customerModel.js";
import { applyPromotions, calculateReward } from "./promotionEngine.js";


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
    paid_amount,
    payment_method,
  } = data;

  if (!price_list_id) throw new Error("price_list_id is required");
  if (!items || items.length === 0)
    throw new Error("Transaction must have at least one item");
  if (!paid_amount || paid_amount <= 0)
    throw new Error("paid_amount is required");
  if (!payment_method) throw new Error("payment_method is required");

  // Validasi customer jika ada
  let customer = null;
  if (customer_id) {
    customer = await customerModel.findById(customer_id);
    if (!customer) throw new Error("Customer not found");
  }

  // Validasi semua items
  const validatedItems = await validateItems(items, price_list_id);

  // Hitung subtotal awal
  const subtotal = validatedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalQty = validatedItems.reduce((sum, item) => sum + item.qty, 0);

  // Context untuk promotion engine
  const context = {
    subtotal,
    totalQty,
    items: validatedItems,
    customerMemberType: customer?.member_type ?? "regular",
  };

  // Evaluasi promotions
  const appliedPromotions = await applyPromotions(
    promo_codes || [],
    voucher_codes || [],
    context,
  );

  // Hitung semua diskon
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

  // Pastikan diskon tidak melebihi subtotal
  totalDiscount = Math.min(totalDiscount, subtotal);
  const grandTotal = subtotal - totalDiscount;
  const changeAmount = Math.max(0, paid_amount - grandTotal);

  if (paid_amount < grandTotal) {
    throw new Error(
      `Insufficient payment. Grand total: ${grandTotal}, Paid: ${paid_amount}`,
    );
  }

  // Validasi free items stock
  for (const { freeItem } of freeItemsToProcess) {
    const variant = await productVariantModel.findById(freeItem.variantId);
    if (!variant)
      throw new Error(`Free item variant ${freeItem.variantId} not found`);
    if (variant.stock_qty < freeItem.qty) {
      throw new Error(`Insufficient stock for free item ${variant.name}`);
    }
  }

  // Mulai transaction database
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const transactionId = uuidv4();
    const invoiceNumber = await generateInvoiceNumber();

    // Insert transaction
    await conn.query(`
  INSERT INTO transactions (
    id, invoice_number, customer_id, status,
    subtotal, total_discount, grand_total, paid_amount,
    change_amount, payment_method, transacted_at, created_at
  ) VALUES (?, ?, ?, 'completed', ?, ?, ?, ?, ?, ?, NOW(), NOW())
`, [
  transactionId, invoiceNumber, customer_id ?? null,
  subtotal, totalDiscount, grandTotal, paid_amount, changeAmount, payment_method,
]);

    // Insert transaction items
    const stockLedgerEntries = [];

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

      // Insert transaction_item_promotions jika ada diskon per item
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

      // Kurangi stock
      const qtyBefore = item.stock_qty;
      const qtyAfter = qtyBefore - item.qty;

      await conn.query(
        `
        UPDATE product_variants SET stock_qty = ? WHERE id = ?
      `,
        [qtyAfter, item.product_variant_id],
      );

      stockLedgerEntries.push({
        id: uuidv4(),
        product_variant_id: item.product_variant_id,
        reference_id: transactionId,
        reference_type: "transaction",
        qty_change: -item.qty,
        qty_before: qtyBefore,
        qty_after: qtyAfter,
        note: `Sale - ${invoiceNumber}`,
      });
    }

    // Insert transaction promotions dan free items
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

      // Insert free items jika ada
      const promoFreeItems = freeItemsToProcess.filter(
        (f) => f.promotionId === tp.promotion.id,
      );

      for (const { freeItem } of promoFreeItems) {
        const freeVariant = await productVariantModel.findById(
          freeItem.variantId,
        );
        const qtyBefore = freeVariant.stock_qty;
        const qtyAfter = qtyBefore - freeItem.qty;

        await conn.query(
          `
          INSERT INTO free_item_rewards (
            id, transaction_promotion_id, product_variant_id, qty, unit_price
          ) VALUES (?, ?, ?, ?, ?)
        `,
          [uuidv4(), tp.id, freeItem.variantId, freeItem.qty, 0],
        );

        await conn.query(
          `
          UPDATE product_variants SET stock_qty = ? WHERE id = ?
        `,
          [qtyAfter, freeItem.variantId],
        );

        stockLedgerEntries.push({
          id: uuidv4(),
          product_variant_id: freeItem.variantId,
          reference_id: transactionId,
          reference_type: "transaction_free_item",
          qty_change: -freeItem.qty,
          qty_before: qtyBefore,
          qty_after: qtyAfter,
          note: `Free item - ${invoiceNumber} - ${tp.promotion.name}`,
        });

        // Update stock_qty di freeVariant agar tidak double kurang jika ada dua free item sama
        freeVariant.stock_qty = qtyAfter;
      }

      // Increment usage count
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

    // Insert stock ledger
    if (stockLedgerEntries.length > 0) {
      const values = stockLedgerEntries.map((e) => [
        e.id,
        e.product_variant_id,
        e.reference_id,
        e.reference_type,
        e.qty_change,
        e.qty_before,
        e.qty_after,
        e.note,
        new Date(),
      ]);
      await conn.query(
        `
        INSERT INTO stock_ledger (
          id, product_variant_id, reference_id, reference_type,
          qty_change, qty_before, qty_after, note, created_at
        ) VALUES ?
      `,
        [values],
      );
    }

    // Update total spend customer
    if (customer_id) {
      await conn.query(
        `
        UPDATE customers SET total_spend = total_spend + ? WHERE id = ?
      `,
        [grandTotal, customer_id],
      );
    }

    await conn.commit();

    // Return full transaction detail
    const transaction = await transactionModel.findById(transactionId);
    const transactionItems =
      await transactionModel.findItemsByTransactionId(transactionId);
    const transactionPromotions =
      await transactionModel.findPromotionsByTransactionId(transactionId);

    return {
      ...transaction,
      items: transactionItems,
      promotions: transactionPromotions,
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

export default { createTransaction, getTransactionById, getAllTransactions };
