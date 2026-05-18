import pool from "../config/database.js";

const findAll = async () => {
  const [products] = await pool.query(`
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

  const [images] = await pool.query(`
    SELECT product_id, image_url, is_primary
    FROM product_images
  `);

  return products.map((product) => {
    const productImages = images
      .filter((img) => img.product_id === product.id)
      .map((img) => ({
        url: img.image_url,
        is_primary: !!img.is_primary,
      }));

    return {
      ...product,
      images: productImages,
    };
  });
};
const findById = async (id) => {
  const [rows] = await pool.query(
    `
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
  `,
    [id],
  );

  const product = rows[0];
  if (!product) return null;

  const [images] = await pool.query(
    `
    SELECT image_url, is_primary
    FROM product_images
    WHERE product_id = ?
  `,
    [id],
  );

  return {
    ...product,
    images: images.map((img) => ({
      url: img.image_url,
      is_primary: !!img.is_primary,
    })),
  };
};
const findVariantsByProductId = async (productId) => {
  const [rows] = await pool.query(
    `
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
  `,
    [productId],
  );
  return rows;
};

const findVariantsByProductIdWithPrice = async (productId, priceListId) => {
  const [rows] = await pool.query(
    `
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
      u.symbol AS unit_symbol,
      pp.price,
      pp.min_qty,
      pl.id AS price_list_id,
      pl.name AS price_list_name,
      pl.code AS price_list_code
    FROM product_variants pv
    LEFT JOIN units u ON pv.unit_id = u.id
    LEFT JOIN product_prices pp ON pp.product_variant_id = pv.id
      AND pp.price_list_id = ?
      AND pp.is_active = true
      AND (pp.valid_from IS NULL OR pp.valid_from <= NOW())
      AND (pp.valid_to IS NULL OR pp.valid_to >= NOW())
    LEFT JOIN price_lists pl ON pp.price_list_id = pl.id
    WHERE pv.product_id = ?
      AND pv.is_active = true
    ORDER BY pv.is_base_unit DESC
  `,
    [priceListId, productId],
  );
  return rows;
};

const create = async (data) => {
  const { id, category_id, name, sku_code, description, barcode, is_active } =
    data;
  await pool.query(
    `
    INSERT INTO products (id, category_id, name, sku_code, description, barcode, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `,
    [id, category_id, name, sku_code, description, barcode, is_active ?? true],
  );
  return findById(id);
};

const update = async (id, data) => {
  const { category_id, name, sku_code, description, barcode, is_active } = data;
  await pool.query(
    `
    UPDATE products
    SET category_id = ?, name = ?, sku_code = ?, description = ?, barcode = ?, is_active = ?, updated_at = NOW()
    WHERE id = ?
  `,
    [category_id, name, sku_code, description, barcode, is_active, id],
  );
  return findById(id);
};

const remove = async (id) => {
  const [result] = await pool.query(`DELETE FROM products WHERE id = ?`, [id]);
  return result.affectedRows;
};

const productModel = {
  findAll,
  findById,
  findVariantsByProductId,
  findVariantsByProductIdWithPrice,
  create,
  update,
  remove,
};

export default productModel;
