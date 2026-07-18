import pool from "../config/database.js";

const create = async (conn, data) => {
  const {
    id,
    invoice_number,
    customer_id,
    status,
    subtotal,
    total_discount,
    grand_total,
    paid_amount,
    change_amount,
    payment_method,
  } = data;

  await conn.query(
    `
    INSERT INTO transactions (
      id, invoice_number, customer_id, status,
      subtotal, total_discount, grand_total, paid_amount,
      change_amount, payment_method, transacted_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `,
    [
      id,
      invoice_number,
      customer_id ?? null,
      status ?? "completed",
      subtotal,
      total_discount,
      grand_total,
      paid_amount,
      change_amount,
      payment_method,
    ],
  );
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      t.*,
      c.name AS customer_name
    FROM transactions t
    LEFT JOIN customers c ON t.customer_id = c.id
    WHERE t.id = ?
  `,
    [id],
  );
  return rows[0] || null;
};
const findAll = async () => {
  const [rows] = await pool.query(`
    SELECT
      t.id,
      t.invoice_number,
      t.status,
      t.subtotal,
      t.total_discount,
      t.grand_total,
      t.paid_amount,
      t.change_amount,
      t.payment_method,
      t.transacted_at,
      t.created_at,
      c.name AS customer_name
    FROM transactions t
    LEFT JOIN customers c ON t.customer_id = c.id
    ORDER BY t.created_at DESC
  `);
  return rows;
};

const findByCustomerId = async (customerId) => {
  const [rows] = await pool.query(
    `
    SELECT
      t.id,
      t.invoice_number,
      t.status,
      t.subtotal,
      t.total_discount,
      t.grand_total,
      t.paid_amount,
      t.change_amount,
      t.payment_method,
      t.transacted_at,
      t.created_at
    FROM transactions t
    WHERE t.customer_id = ?
    ORDER BY t.created_at DESC
  `,
    [customerId],
  );
  return rows;
};

const findItemsByTransactionId = async (transactionId) => {
  const [rows] = await pool.query(
    `
    SELECT
      ti.*,
      pv.name AS variant_name,
      pl.name AS price_list_name
    FROM transaction_items ti
    LEFT JOIN product_variants pv ON ti.product_variant_id = pv.id
    LEFT JOIN price_lists pl ON ti.price_list_id = pl.id
    WHERE ti.transaction_id = ?
  `,
    [transactionId],
  );
  return rows;
};

const findPromotionsByTransactionId = async (transactionId) => {
  const [rows] = await pool.query(
    `
    SELECT
      tp.*,
      p.name AS promotion_name,
      p.code AS promotion_code,
      v.code AS voucher_code
    FROM transaction_promotions tp
    LEFT JOIN promotions p ON tp.promotion_id = p.id
    LEFT JOIN vouchers v ON tp.voucher_id = v.id
    WHERE tp.transaction_id = ?
  `,
    [transactionId],
  );
  return rows;
};

const findFreeItemsByTransactionPromotionId = async (
  transactionPromotionId,
) => {
  const [rows] = await pool.query(
    `
    SELECT
      fir.*,
      pv.name AS variant_name
    FROM free_item_rewards fir
    LEFT JOIN product_variants pv ON fir.product_variant_id = pv.id
    WHERE fir.transaction_promotion_id = ?
  `,
    [transactionPromotionId],
  );
  return rows;
};

export default {
  findById,
  findAll,
  findByCustomerId,
  findItemsByTransactionId,
  findPromotionsByTransactionId,
  findFreeItemsByTransactionPromotionId,
};
