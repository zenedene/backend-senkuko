const { v4: uuidv4 } = require('uuid');

const parentCategories = [
  { id: uuidv4(), name: 'Minuman', slug: 'minuman' },
  { id: uuidv4(), name: 'Makanan', slug: 'makanan' },
  { id: uuidv4(), name: 'Snack', slug: 'snack' },
];

exports.seed = async function (knex) {
   await knex('free_item_rewards').del();
  await knex('transaction_item_promotions').del();
  await knex('transaction_promotions').del();
  await knex('transaction_items').del();
  await knex('transactions').del();
  await knex('vouchers').del();
  await knex('promotion_rewards').del();
  await knex('promotion_conditions').del();
  await knex('promotions').del();
  await knex('product_prices').del();
  await knex('stock_ledger').del();
  await knex('product_variants').del();
  await knex('products').del();
  await knex('categories').del();
  await knex('categories').del();

  await knex('categories').insert(
    parentCategories.map((cat) => ({
      ...cat,
      parent_id: null,
      sort_order: 0,
      is_active: true,
      created_at: new Date(),
    }))
  );

  await knex('categories').insert([
    {
      id: uuidv4(),
      name: 'Minuman Dingin',
      slug: 'minuman-dingin',
      parent_id: parentCategories[0].id,
      sort_order: 1,
      is_active: true,
      created_at: new Date(),
    },
    {
      id: uuidv4(),
      name: 'Minuman Panas',
      slug: 'minuman-panas',
      parent_id: parentCategories[0].id,
      sort_order: 2,
      is_active: true,
      created_at: new Date(),
    },
    {
      id: uuidv4(),
      name: 'Makanan Berat',
      slug: 'makanan-berat',
      parent_id: parentCategories[1].id,
      sort_order: 1,
      is_active: true,
      created_at: new Date(),
    },
  ]);
};