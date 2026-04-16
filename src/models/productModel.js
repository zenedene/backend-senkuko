const pool = require('../config/database');

const findAll = async () => {
  const [rows] = await pool.query(`
    SELECT
      p.id,
      p.name,
      p.sku_code,
      p.description,
      p.barcode,
      p.is_active,
      p.created_at,
      c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `);
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(`
    SELECT
      p.id,
      p.name,
      p.sku_code,
      p.description,
      p.barcode,
      p.is_active,
      p.created_at,
      p.updated_at,
      c.name AS category_name,
      c.id AS category_id
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `, [id]);
  return rows[0] || null;
};

const findVariantsByProductId = async (productId) => {
  const [rows] = await pool.query(`
    SELECT
      pv.id,
      pv.name,
      pv.barcode,
      pv.stock_qty,
      pv.min_stock_qty,
      pv.conversion_factor,
      pv.is_base_unit,
      pv.is_active,
      u.name AS unit_name,
      u.symbol AS unit_symbol
    FROM product_variants pv
    LEFT JOIN units u ON pv.unit_id = u.id
    WHERE pv.product_id = ?
    ORDER BY pv.is_base_unit DESC
  `, [productId]);
  return rows;
};

const create = async (data) => {
  const { id, category_id, name, sku_code, description, barcode, is_active } = data;
  await pool.query(`
    INSERT INTO products (id, category_id, name, sku_code, description, barcode, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `, [id, category_id, name, sku_code, description, barcode, is_active ?? true]);
  return findById(id);
};

const update = async (id, data) => {
  const { category_id, name, sku_code, description, barcode, is_active } = data;
  await pool.query(`
    UPDATE products
    SET category_id = ?, name = ?, sku_code = ?, description = ?, barcode = ?, is_active = ?, updated_at = NOW()
    WHERE id = ?
  `, [category_id, name, sku_code, description, barcode, is_active, id]);
  return findById(id);
};

const remove = async (id) => {
  const [result] = await pool.query(`DELETE FROM products WHERE id = ?`, [id]);
  return result.affectedRows;
};

module.exports = { findAll, findById, findVariantsByProductId, create, update, remove };