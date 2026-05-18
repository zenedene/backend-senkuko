// 03_product_variants.js
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex) {
  // Clear dependent price table first
  await knex('product_prices').del();
  await knex('product_variants').del();

  // Look‑up ids we need for the FK columns
  const products = await knex('products').select('id', 'sku_code');
  const units    = await knex('units').select('id', 'symbol');

  const getProductId = sku => products.find(p => p.sku_code === sku)?.id;
  const getUnitId    = sym => units.find(u => u.symbol === sym)?.id;

  await knex('product_variants').insert([
    // --- Aqua -------------------------------------------------
    {
      id: uuidv4(),
      product_id: getProductId('PRD-001'),
      unit_id: getUnitId('pcs'),
      name: 'Aqua 600ml',
      barcode: '8999999001001',
      stock_qty: 200,
      min_stock_qty: 20,
      conversion_factor: 1,
      is_base_unit: true,
      is_active: true,
      created_at: new Date(),
    },
    {
      id: uuidv4(),
      product_id: getProductId('PRD-001'),
      unit_id: getUnitId('box'),
      name: 'Aqua 600ml (Box)',
      barcode: '8999999001002',
      stock_qty: 10,
      min_stock_qty: 2,
      conversion_factor: 24,
      is_base_unit: false,
      is_active: true,
      created_at: new Date(),
    },

    // --- Teh Botol -------------------------------------------
    {
      id: uuidv4(),
      product_id: getProductId('PRD-002'),
      unit_id: getUnitId('pcs'),
      name: 'Teh Botol 350ml',
      barcode: '8999999002001',
      stock_qty: 150,
      min_stock_qty: 15,
      conversion_factor: 1,
      is_base_unit: true,
      is_active: true,
      created_at: new Date(),
    },

    // --- Kopi Kapal Api ---------------------------------------
    {
      id: uuidv4(),
      product_id: getProductId('PRD-003'),
      unit_id: getUnitId('pcs'),
      name: 'Kopi Kapal Api Sachet',
      barcode: '8999999003001',
      stock_qty: 300,
      min_stock_qty: 50,
      conversion_factor: 1,
      is_base_unit: true,
      is_active: true,
      created_at: new Date(),
    },

    // --- Indomie Goreng ---------------------------------------
    {
      id: uuidv4(),
      product_id: getProductId('PRD-004'),
      unit_id: getUnitId('pcs'),
      name: 'Indomie Goreng',
      barcode: '8999999004001',
      stock_qty: 500,
      min_stock_qty: 50,
      conversion_factor: 1,
      is_base_unit: true,
      is_active: true,
      created_at: new Date(),
    },
    {
      id: uuidv4(),
      product_id: getProductId('PRD-004'),
      unit_id: getUnitId('box'),
      name: 'Indomie Goreng (Box)',
      barcode: '8999999004002',
      stock_qty: 20,
      min_stock_qty: 5,
      conversion_factor: 40,
      is_base_unit: false,
      is_active: true,
      created_at: new Date(),
    },

    // --- Chitato ---------------------------------------------
    {
      id: uuidv4(),
      product_id: getProductId('PRD-005'),
      unit_id: getUnitId('pcs'),
      name: 'Chitato 68gr',
      barcode: '8999999005001',
      stock_qty: 100,
      min_stock_qty: 10,
      conversion_factor: 1,
      is_base_unit: true,
      is_active: true,
      created_at: new Date(),
    },
  ]);
}
