import pool from '../config/database.js';

const findAll = async () => {
  const [rows] = await pool.query(`
    SELECT id, image_url, public_id, title, sort_order, is_active, created_at, updated_at
    FROM banners
    ORDER BY sort_order ASC, created_at ASC
  `);
  return rows;
};

const findAllActive = async () => {
  const [rows] = await pool.query(`
    SELECT id, image_url, title, sort_order
    FROM banners
    WHERE is_active = true
    ORDER BY sort_order ASC, created_at ASC
  `);
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(`
    SELECT id, image_url, public_id, title, sort_order, is_active, created_at, updated_at
    FROM banners
    WHERE id = ?
  `, [id]);
  return rows[0] || null;
};

const create = async (data) => {
  const { id, image_url, public_id, title, sort_order, is_active } = data;
  await pool.query(`
    INSERT INTO banners (id, image_url, public_id, title, sort_order, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
  `, [id, image_url, public_id, title ?? null, sort_order ?? 0, is_active ?? true]);
  return findById(id);
};

const update = async (id, data) => {
  const { image_url, public_id, title, sort_order, is_active } = data;
  await pool.query(`
    UPDATE banners
    SET image_url = ?, public_id = ?, title = ?, sort_order = ?, is_active = ?, updated_at = NOW()
    WHERE id = ?
  `, [image_url, public_id, title ?? null, sort_order ?? 0, is_active, id]);
  return findById(id);
};

const updateImage = async (id, image_url, public_id) => {
  await pool.query(`
    UPDATE banners SET image_url = ?, public_id = ?, updated_at = NOW() WHERE id = ?
  `, [image_url, public_id, id]);
  return findById(id);
};

const remove = async (id) => {
  const [result] = await pool.query(`DELETE FROM banners WHERE id = ?`, [id]);
  return result.affectedRows;
};

const bannerModel = { findAll, findAllActive, findById, create, update, updateImage, remove };
export default bannerModel;
