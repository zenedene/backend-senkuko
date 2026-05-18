// 07_promotions.js
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex) {
  // Wipe old promotion data
  await knex('promotion_rewards').del();
  await knex('promotion_conditions').del();
  await knex('promotions').del();

  await knex('promotions').insert([
    {
      id: uuidv4(),
      name: 'Diskon Akhir Bulan',
      code: 'AKHIRBULAN',
      type: 'discount_percent',
      description: 'Diskon 10% untuk semua produk',
      valid_from: new Date(),
      valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      usage_limit: 0,
      usage_count: 0,
      is_active: true,
      stackable: false,
      created_at: new Date(),
    },
    {
      id: uuidv4(),
      name: 'Gratis Ongkir Member',
      code: 'MEMBER10',
      type: 'discount_fixed',
      description: 'Potongan Rp 10.000 untuk member',
      valid_from: new Date(),
      valid_to: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      usage_limit: 0,
      usage_count: 0,
      is_active: true,
      stackable: true,
      created_at: new Date(),
    },
  ]);
}
