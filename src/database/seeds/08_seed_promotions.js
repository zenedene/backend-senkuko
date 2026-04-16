const { v4: uuidv4 } = require('uuid');

exports.seed = async function (knex) {
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
      valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
      valid_to: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      usage_limit: 0,
      usage_count: 0,
      is_active: true,
      stackable: true,
      created_at: new Date(),
    },
  ]);
};