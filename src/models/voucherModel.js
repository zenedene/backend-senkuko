import pool from '../config/database.js';

const findAll = async () => {
  const [rows] = await pool.query(`
    SELECT
      v.*,
      p.name AS promotion_name,
      p.code AS promotion_code
    FROM vouchers v
    LEFT JOIN promotions p ON v.promotion_id = p.id
    ORDER BY v.promotion_id, v.code ASC
  `);
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(`
    SELECT
      v.*,
      p.name AS promotion_name,
      p.code AS promotion_code
    FROM vouchers v
    LEFT JOIN promotions p ON v.promotion_id = p.id
    WHERE v.id = ?
  `, [id]);
  return rows[0] || null;
};

const findByCode = async (code) => {
  const [rows] = await pool.query(`
    SELECT * FROM vouchers WHERE code = ?
  `, [code]);
  return rows[0] || null;
};

const findByPromotionId = async (promotionId) => {
  const [rows] = await pool.query(`
    SELECT * FROM vouchers WHERE promotion_id = ?
    ORDER BY code ASC
  `, [promotionId]);
  return rows;
};

const create = async (data) => {
  const { id, promotion_id, code, usage_limit, visibility } = data;
  await pool.query(`
    INSERT INTO vouchers (id, promotion_id, code, status, usage_limit, usage_count, visibility)
    VALUES (?, ?, ?, 'active', ?, 0, ?)
  `, [id, promotion_id, code, usage_limit ?? 1, visibility ?? 'public']);
  return findById(id);
};

const update = async (id, data) => {
  const current = await findById(id);
  const { code, status, usage_limit, visibility } = data;
  await pool.query(`
    UPDATE vouchers
    SET code = ?, status = ?, usage_limit = ?, visibility = ?
    WHERE id = ?
  `, [
    code ?? current.code,
    status ?? current.status,
    usage_limit ?? current.usage_limit,
    visibility ?? current.visibility,
    id,
  ]);
  return findById(id);
};

const remove = async (id) => {
  const [result] = await pool.query(`DELETE FROM vouchers WHERE id = ?`, [id]);
  return result.affectedRows;
};

const countUsage = async (id) => {
  const [rows] = await pool.query(`
    SELECT COUNT(*) AS total FROM transaction_promotions WHERE voucher_id = ?
  `, [id]);
  return rows[0].total;
};

export default { findAll, findById, findByCode, findByPromotionId, create, update, remove, countUsage };