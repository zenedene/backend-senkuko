import pool from "../config/database.js";

const findActivePromotions = async (now) => {
  const [rows] = await pool.query(
    `
    SELECT * FROM promotions
    WHERE is_active = true
      AND (valid_from IS NULL OR valid_from <= ?)
      AND (valid_to IS NULL OR valid_to >= ?)
    ORDER BY created_at ASC
  `,
    [now, now],
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM promotions WHERE id = ?`, [
    id,
  ]);
  return rows[0] || null;
};

const findByCode = async (code) => {
  const [rows] = await pool.query(`SELECT * FROM promotions WHERE code = ?`, [
    code,
  ]);
  return rows[0] || null;
};

const findConditionsByPromotionId = async (promotionId) => {
  const [rows] = await pool.query(
    `
    SELECT * FROM promotion_conditions WHERE promotion_id = ?
  `,
    [promotionId],
  );
  return rows;
};

const findRewardsByPromotionId = async (promotionId) => {
  const [rows] = await pool.query(
    `
    SELECT * FROM promotion_rewards WHERE promotion_id = ?
  `,
    [promotionId],
  );
  return rows;
};

const findVoucherByCode = async (code) => {
  const [rows] = await pool.query(
    `
    SELECT v.*, p.id AS promotion_id, p.name AS promotion_name, p.code AS promotion_code,
           p.type, p.description, p.valid_from, p.valid_to, p.usage_limit AS promotion_usage_limit,
           p.usage_count AS promotion_usage_count, p.is_active, p.stackable, p.created_at
    FROM vouchers v
    LEFT JOIN promotions p ON v.promotion_id = p.id
    WHERE LOWER(v.code) = LOWER(?) AND v.status = 'active'
  `,
    [code],
  );
  return rows[0] || null;
};

const incrementUsageCount = async (promotionId) => {
  await pool.query(
    `
    UPDATE promotions SET usage_count = usage_count + 1 WHERE id = ?
  `,
    [promotionId],
  );
};

const markVoucherAsUsed = async (voucherId) => {
  await pool.query(
    `
    UPDATE vouchers
    SET status = 'used', usage_count = usage_count + 1
    WHERE id = ?
  `,
    [voucherId],
  );
};

const promotionModel = {
  findActivePromotions,
  findById,
  findByCode,
  findConditionsByPromotionId,
  findRewardsByPromotionId,
  findVoucherByCode,
  incrementUsageCount,
  markVoucherAsUsed,
};
export default promotionModel;
