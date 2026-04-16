const pool = require('../config/database');

const findAll = async () => {
  const [rows] = await pool.query(`
    SELECT id, name, phone, email, member_type, total_spend, created_at
    FROM customers
    ORDER BY created_at DESC
  `);
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(`
    SELECT id, name, phone, email, member_type, total_spend, created_at
    FROM customers
    WHERE id = ?
  `, [id]);
  return rows[0] || null;
};

const findByPhone = async (phone) => {
  const [rows] = await pool.query(`
    SELECT id, name, phone, email, member_type, total_spend, created_at
    FROM customers
    WHERE phone = ?
  `, [phone]);
  return rows[0] || null;
};

const findByEmail = async (email) => {
  const [rows] = await pool.query(`
    SELECT id, name, phone, email, member_type, total_spend, created_at
    FROM customers
    WHERE email = ?
  `, [email]);
  return rows[0] || null;
};

const create = async (data) => {
  const { id, name, phone, email, member_type, total_spend } = data;
  await pool.query(`
    INSERT INTO customers (id, name, phone, email, member_type, total_spend, created_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `, [id, name, phone ?? null, email ?? null, member_type ?? 'regular', total_spend ?? 0]);
  return findById(id);
};

const update = async (id, data) => {
  const { name, phone, email, member_type } = data;
  await pool.query(`
    UPDATE customers
    SET name = ?, phone = ?, email = ?, member_type = ?
    WHERE id = ?
  `, [name, phone ?? null, email ?? null, member_type, id]);
  return findById(id);
};

const updateTotalSpend = async (id, amount) => {
  await pool.query(`
    UPDATE customers
    SET total_spend = total_spend + ?
    WHERE id = ?
  `, [amount, id]);
  return findById(id);
};

const remove = async (id) => {
  const [result] = await pool.query(`DELETE FROM customers WHERE id = ?`, [id]);
  return result.affectedRows;
};

module.exports = { findAll, findById, findByPhone, findByEmail, create, update, updateTotalSpend, remove };