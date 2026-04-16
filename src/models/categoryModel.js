import pool from '../config/database.js';

const findAll = async () => {
  const [rows] = await pool.query(`
    SELECT
      c.id,
      c.name,
      c.slug,
      c.sort_order,
      c.is_active,
      c.created_at,
      p.name AS parent_name,
      p.id AS parent_id
    FROM categories c
    LEFT JOIN categories p ON c.parent_id = p.id
    ORDER BY c.sort_order ASC, c.created_at ASC
  `);
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(`
    SELECT
      c.id,
      c.name,
      c.slug,
      c.sort_order,
      c.is_active,
      c.created_at,
      p.name AS parent_name,
      p.id AS parent_id
    FROM categories c
    LEFT JOIN categories p ON c.parent_id = p.id
    WHERE c.id = ?
  `, [id]);
  return rows[0] || null;
};

const findChildren = async (parentId) => {
  const [rows] = await pool.query(`
    SELECT id, name, slug, sort_order, is_active
    FROM categories
    WHERE parent_id = ?
    ORDER BY sort_order ASC
  `, [parentId]);
  return rows;
};

const create = async (data) => {
  const { id, name, slug, parent_id, sort_order, is_active } = data;
  await pool.query(`
    INSERT INTO categories (id, name, slug, parent_id, sort_order, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `, [id, name, slug, parent_id ?? null, sort_order ?? 0, is_active ?? true]);
  return findById(id);
};

const update = async (id, data) => {
  const { name, slug, parent_id, sort_order, is_active } = data;
  await pool.query(`
    UPDATE categories
    SET name = ?, slug = ?, parent_id = ?, sort_order = ?, is_active = ?
    WHERE id = ?
  `, [name, slug, parent_id ?? null, sort_order ?? 0, is_active, id]);
  return findById(id);
};

const remove = async (id) => {
  const [result] = await pool.query(`DELETE FROM categories WHERE id = ?`, [id]);
  return result.affectedRows;
};

const countProductsByCategory = async (categoryId) => {
  const [rows] = await pool.query(`
    SELECT COUNT(*) AS total
    FROM products
    WHERE category_id = ?
  `, [categoryId]);
  return rows[0].total;
};

const categoryModel = { findAll, findById, findChildren, countProductsByCategory, create, update, remove };
export default categoryModel