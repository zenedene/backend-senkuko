import pool from'../config/database.js';

const insertMany = async (entries) => {
  if (!entries.length) return;

  const values = entries.map(e => [
    e.id,
    e.product_variant_id,
    e.reference_id,
    e.reference_type,
    e.qty_change,
    e.qty_before,
    e.qty_after,
    e.note,
  ]);

  await pool.query(`
    INSERT INTO stock_ledger (
      id, product_variant_id, reference_id, reference_type,
      qty_change, qty_before, qty_after, note, created_at
    ) VALUES ?
  `, [values.map(v => [...v, new Date()])]);
};

const findByVariantId = async (variantId) => {
  const [rows] = await pool.query(`
    SELECT * FROM stock_ledger
    WHERE product_variant_id = ?
    ORDER BY created_at DESC
  `, [variantId]);
  return rows;
};

const stockLedgerModel = { insertMany, findByVariantId };
export default stockLedgerModel