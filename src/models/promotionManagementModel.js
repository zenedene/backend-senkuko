import pool from '../config/database.js';

const findAll = async () => {
  const [rows] = await pool.query(`
    SELECT * FROM promotions
    ORDER BY created_at DESC
  `);
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(`
    SELECT * FROM promotions WHERE id = ?
  `, [id]);
  return rows[0] || null;
};

const findByCode = async (code) => {
  const [rows] = await pool.query(`
    SELECT * FROM promotions WHERE code = ?
  `, [code]);
  return rows[0] || null;
};

const findConditionsByPromotionId = async (promotionId) => {
  const [rows] = await pool.query(`
    SELECT * FROM promotion_conditions WHERE promotion_id = ?
  `, [promotionId]);
  return rows;
};

const findRewardsByPromotionId = async (promotionId) => {
  const [rows] = await pool.query(`
    SELECT * FROM promotion_rewards WHERE promotion_id = ?
  `, [promotionId]);
  return rows;
};

const findConditionById = async (id) => {
  const [rows] = await pool.query(`
    SELECT * FROM promotion_conditions WHERE id = ?
  `, [id]);
  return rows[0] || null;
};

const findRewardById = async (id) => {
  const [rows] = await pool.query(`
    SELECT * FROM promotion_rewards WHERE id = ?
  `, [id]);
  return rows[0] || null;
};

const create = async (data) => {
  const {
    id, name, code, type, description,
    valid_from, valid_to, usage_limit,
    is_active, stackable,
  } = data;

  await pool.query(`
    INSERT INTO promotions (
      id, name, code, type, description,
      valid_from, valid_to, usage_limit, usage_count,
      is_active, stackable, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, NOW())
  `, [
    id, name, code, type, description ?? null,
    valid_from ?? null, valid_to ?? null, usage_limit ?? 0,
    is_active ?? true, stackable ?? false,
  ]);

  return findById(id);
};

const update = async (id, data) => {
  const {
    name, code, type, description,
    valid_from, valid_to, usage_limit,
    is_active, stackable,
  } = data;

  await pool.query(`
    UPDATE promotions
    SET name = ?, code = ?, type = ?, description = ?,
        valid_from = ?, valid_to = ?, usage_limit = ?,
        is_active = ?, stackable = ?
    WHERE id = ?
  `, [
    name, code, type, description ?? null,
    valid_from ?? null, valid_to ?? null, usage_limit ?? 0,
    is_active, stackable, id,
  ]);

  return findById(id);
};

const remove = async (id) => {
  const [result] = await pool.query(`DELETE FROM promotions WHERE id = ?`, [id]);
  return result.affectedRows;
};

const createCondition = async (data) => {
  const { id, promotion_id, condition_type, operator, value, target_type, target_id } = data;

  await pool.query(`
    INSERT INTO promotion_conditions (
      id, promotion_id, condition_type, operator, value, target_type, target_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [id, promotion_id, condition_type, operator, value, target_type ?? null, target_id ?? null]);

  return findConditionById(id);
};

const createReward = async (data) => {
  const {
    id, promotion_id, reward_type, discount_value,
    discount_mode, free_variant_id, free_qty, max_discount_amount, metadata,
  } = data;

  await pool.query(`
    INSERT INTO promotion_rewards (
      id, promotion_id, reward_type, discount_value,
      discount_mode, free_variant_id, free_qty, max_discount_amount, metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id, promotion_id, reward_type, discount_value ?? 0,
    discount_mode ?? null, free_variant_id ?? null, free_qty ?? 0,
    max_discount_amount ?? 0, metadata ?? null,
  ]);

  return findRewardById(id);
};

const removeCondition = async (id) => {
  const [result] = await pool.query(`DELETE FROM promotion_conditions WHERE id = ?`, [id]);
  return result.affectedRows;
};

const removeReward = async (id) => {
  const [result] = await pool.query(`DELETE FROM promotion_rewards WHERE id = ?`, [id]);
  return result.affectedRows;
};

const countUsage = async (id) => {
  const [rows] = await pool.query(`
    SELECT COUNT(*) AS total FROM transaction_promotions WHERE promotion_id = ?
  `, [id]);
  return rows[0].total;
};

export default {
  findAll, findById, findByCode,
  findConditionsByPromotionId, findRewardsByPromotionId,
  findConditionById, findRewardById,
  create, update, remove,
  createCondition, createReward,
  removeCondition, removeReward,
  countUsage,
};