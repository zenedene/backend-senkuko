// 02_products.js
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex) {
  // NOTE: make sure the tables that reference products are empty first
  await knex('product_prices').del();
  await knex('product_variants').del();
  await knex('products').del();

  // Grab the category ids once – we need them for the FK `category_id`
  const categories = await knex('categories').select('id', 'slug');
  const getCategoryId = slug => categories.find(c => c.slug === slug)?.id;

  await knex('products').insert([
    {
      id: uuidv4(),
      category_id: getCategoryId('minuman-dingin'),
      name: 'Aqua',
      sku_code: 'PRD-001',
      description: 'Air mineral dalam kemasan',
      barcode: '8999999001001',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      category_id: getCategoryId('minuman-dingin'),
      name: 'Teh Botol Sosro',
      sku_code: 'PRD-002',
      description: 'Teh manis dalam botol',
      barcode: '8999999002001',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      category_id: getCategoryId('minuman-panas'),
      name: 'Kopi Kapal Api',
      sku_code: 'PRD-003',
      description: 'Kopi bubuk sachet',
      barcode: '8999999003001',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      category_id: getCategoryId('makanan-berat'),
      name: 'Indomie Goreng',
      sku_code: 'PRD-004',
      description: 'Mie instan goreng',
      barcode: '8999999004001',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      category_id: getCategoryId('snack'),
      name: 'Chitato',
      sku_code: 'PRD-005',
      description: 'Keripik kentang',
      barcode: '8999999005001',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}
