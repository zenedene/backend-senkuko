import pool from '../config/database.js';

const findAll = async () => {
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
      pv.created_at,
      p.id AS product_id,
      p.name AS product_name,
      u.id AS unit_id,
      u.name AS unit_name,
      u.symbol AS unit_symbol
    FROM product_variants pv
    LEFT JOIN products p ON pv.product_id = p.id
    LEFT JOIN units u ON pv.unit_id = u.id
    ORDER BY p.name ASC, pv.is_base_unit DESC
  `);
  return rows;
};

const findById = async (id) => {
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
      pv.created_at,
      p.id AS product_id,
      p.name AS product_name,
      u.id AS unit_id,
      u.name AS unit_name,
      u.symbol AS unit_symbol
    FROM product_variants pv
    LEFT JOIN products p ON pv.product_id = p.id
    LEFT JOIN units u ON pv.unit_id = u.id
    WHERE pv.id = ?
  `, [id]);
  return rows[0] || null;
};

const findByProductId = async (productId) => {
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
      pv.created_at,
      u.id AS unit_id,
      u.name AS unit_name,
      u.symbol AS unit_symbol
    FROM product_variants pv
    LEFT JOIN units u ON pv.unit_id = u.id
    WHERE pv.product_id = ?
    ORDER BY pv.is_base_unit DESC
  `, [productId]);
  return rows;
};

const countByProductId = async (productId) => {
  const [rows] = await pool.query(`
    SELECT COUNT(*) AS total
    FROM product_variants
    WHERE product_id = ?
  `, [productId]);
  return rows[0].total;
};

const create = async (data) => {
  const { id, product_id, unit_id, name, barcode, stock_qty, min_stock_qty, conversion_factor, is_base_unit, is_active } = data;
  await pool.query(`
    INSERT INTO product_variants (id, product_id, unit_id, name, barcode, stock_qty, min_stock_qty, conversion_factor, is_base_unit, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `, [id, product_id, unit_id, name, barcode ?? null, stock_qty ?? 0, min_stock_qty ?? 0, conversion_factor ?? 1, is_base_unit ?? false, is_active ?? true]);
  return findById(id);
};

const update = async (id, data) => {
  const { unit_id, name, barcode, stock_qty, min_stock_qty, conversion_factor, is_base_unit, is_active } = data;
  await pool.query(`
    UPDATE product_variants
    SET unit_id = ?, name = ?, barcode = ?, stock_qty = ?, min_stock_qty = ?, conversion_factor = ?, is_base_unit = ?, is_active = ?
    WHERE id = ?
  `, [unit_id, name, barcode ?? null, stock_qty ?? 0, min_stock_qty ?? 0, conversion_factor ?? 1, is_base_unit ?? false, is_active, id]);
  return findById(id);
};

const remove = async (id) => {
  const [result] = await pool.query(`DELETE FROM product_variants WHERE id = ?`, [id]);
  return result.affectedRows;
};

const productVariantModel = { findAll, findById, findByProductId, countByProductId, create, update, remove };
export default productVariantModel