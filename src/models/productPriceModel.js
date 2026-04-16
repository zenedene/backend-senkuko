import pool from '../config/database.js';

const findAll = async () => {
  const [rows] = await pool.query(`
    SELECT
      pp.id,
      pp.min_qty,
      pp.price,
      pp.valid_from,
      pp.valid_to,
      pp.is_active,
      pv.id AS product_variant_id,
      pv.name AS product_variant_name,
      pl.id AS price_list_id,
      pl.name AS price_list_name,
      pl.code AS price_list_code
    FROM product_prices pp
    LEFT JOIN product_variants pv ON pp.product_variant_id = pv.id
    LEFT JOIN price_lists pl ON pp.price_list_id = pl.id
    ORDER BY pv.name ASC, pl.name ASC, pp.min_qty ASC
  `);
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(`
    SELECT
      pp.id,
      pp.min_qty,
      pp.price,
      pp.valid_from,
      pp.valid_to,
      pp.is_active,
      pv.id AS product_variant_id,
      pv.name AS product_variant_name,
      pl.id AS price_list_id,
      pl.name AS price_list_name,
      pl.code AS price_list_code
    FROM product_prices pp
    LEFT JOIN product_variants pv ON pp.product_variant_id = pv.id
    LEFT JOIN price_lists pl ON pp.price_list_id = pl.id
    WHERE pp.id = ?
  `, [id]);
  return rows[0] || null;
};

const findByVariantId = async (variantId) => {
  const [rows] = await pool.query(`
    SELECT
      pp.id,
      pp.min_qty,
      pp.price,
      pp.valid_from,
      pp.valid_to,
      pp.is_active,
      pl.id AS price_list_id,
      pl.name AS price_list_name,
      pl.code AS price_list_code
    FROM product_prices pp
    LEFT JOIN price_lists pl ON pp.price_list_id = pl.id
    WHERE pp.product_variant_id = ?
    ORDER BY pl.name ASC, pp.min_qty ASC
  `, [variantId]);
  return rows;
};

const findDuplicate = async (variantId, priceListId, minQty, excludeId = null) => {
  let query = `
    SELECT id FROM product_prices
    WHERE product_variant_id = ? AND price_list_id = ? AND min_qty = ?
  `;
  const params = [variantId, priceListId, minQty];

  if (excludeId) {
    query += ` AND id != ?`;
    params.push(excludeId);
  }

  const [rows] = await pool.query(query, params);
  return rows[0] || null;
};

const countByVariantId = async (variantId) => {
  const [rows] = await pool.query(`
    SELECT COUNT(*) AS total
    FROM product_prices
    WHERE product_variant_id = ?
  `, [variantId]);
  return rows[0].total;
};

const create = async (data) => {
  const { id, product_variant_id, price_list_id, min_qty, price, valid_from, valid_to, is_active } = data;
  await pool.query(`
    INSERT INTO product_prices (id, product_variant_id, price_list_id, min_qty, price, valid_from, valid_to, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, product_variant_id, price_list_id, min_qty ?? 1, price, valid_from ?? null, valid_to ?? null, is_active ?? true]);
  return findById(id);
};

const update = async (id, data) => {
  const { price_list_id, min_qty, price, valid_from, valid_to, is_active } = data;
  await pool.query(`
    UPDATE product_prices
    SET price_list_id = ?, min_qty = ?, price = ?, valid_from = ?, valid_to = ?, is_active = ?
    WHERE id = ?
  `, [price_list_id, min_qty ?? 1, price, valid_from ?? null, valid_to ?? null, is_active, id]);
  return findById(id);
};

const remove = async (id) => {
  const [result] = await pool.query(`DELETE FROM product_prices WHERE id = ?`, [id]);
  return result.affectedRows;
};

const productPriceModel = {
  findAll,
  findById,
  findByVariantId,
  findDuplicate,
  countByVariantId,
  create,
  update,
  remove,
};
export default productPriceModel