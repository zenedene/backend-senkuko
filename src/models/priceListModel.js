import pool from '../config/database.js';

const findAll = async () => {
  const [rows] = await pool.query(`
    SELECT id, name, code, description, is_active
    FROM price_lists
    ORDER BY name ASC
  `);
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(`
    SELECT id, name, code, description, is_active
    FROM price_lists
    WHERE id = ?
  `, [id]);
  return rows[0] || null;
};

const findByCode = async (code) => {
  const [rows] = await pool.query(`
    SELECT id, name, code, description, is_active
    FROM price_lists
    WHERE code = ?
  `, [code]);
  return rows[0] || null;
};

const countUsageByPriceList = async (id) => {
  const [rows] = await pool.query(`
    SELECT COUNT(*) AS total
    FROM product_prices
    WHERE price_list_id = ?
  `, [id]);
  return rows[0].total;
};

const create = async (data) => {
  const { id, name, code, description, is_active } = data;
  await pool.query(`
    INSERT INTO price_lists (id, name, code, description, is_active)
    VALUES (?, ?, ?, ?, ?)
  `, [id, name, code, description ?? null, is_active ?? true]);
  return findById(id);
};

const update = async (id, data) => {
  const { name, code, description, is_active } = data;
  await pool.query(`
    UPDATE price_lists
    SET name = ?, code = ?, description = ?, is_active = ?
    WHERE id = ?
  `, [name, code, description ?? null, is_active, id]);
  return findById(id);
};

const remove = async (id) => {
  const [result] = await pool.query(`DELETE FROM price_lists WHERE id = ?`, [id]);
  return result.affectedRows;
};

const priceListModel = { findAll, findById, findByCode, countUsageByPriceList, create, update, remove };
export default priceListModel