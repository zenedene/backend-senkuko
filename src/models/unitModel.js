import pool from '../config/database.js';

const findAll = async () => {
  const [rows] = await pool.query(`
    SELECT id, name, symbol, description
    FROM units
    ORDER BY name ASC
  `);
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(`
    SELECT id, name, symbol, description
    FROM units
    WHERE id = ?
  `, [id]);
  return rows[0] || null;
};

const create = async (data) => {
  const { id, name, symbol, description } = data;
  await pool.query(`
    INSERT INTO units (id, name, symbol, description)
    VALUES (?, ?, ?, ?)
  `, [id, name, symbol, description ?? null]);
  return findById(id);
};

const update = async (id, data) => {
  const { name, symbol, description } = data;
  await pool.query(`
    UPDATE units
    SET name = ?, symbol = ?, description = ?
    WHERE id = ?
  `, [name, symbol, description ?? null, id]);
  return findById(id);
};

const remove = async (id) => {
  const [result] = await pool.query(`DELETE FROM units WHERE id = ?`, [id]);
  return result.affectedRows;
};

const unitModel = { findAll, findById, create, update, remove };
export default unitModel