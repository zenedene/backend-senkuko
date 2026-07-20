// 13_free_item_rewards.js
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex) {
  await knex('free_item_rewards').del();

  const transactionPromotions = await knex('transaction_promotions')
    .join('transactions', 'transaction_promotions.transaction_id', 'transactions.id')
    .select('transaction_promotions.id as tp_id', 'transactions.invoice_number');

  const variants = await knex('product_variants').select('id', 'name');

  const getTpId = inv => transactionPromotions.find(t => t.invoice_number === inv)?.tp_id;
  const getVariantId = name => variants.find(v => v.name === name)?.id;

  await knex('free_item_rewards').insert([
    // Free item reward for INV-20260701-001 (buy 2 Aqua 600ml, get 1 Kopi Kapal Api free)
    {
      id: uuidv4(),
      transaction_promotion_id: getTpId('INV-20260701-001'),
      product_variant_id: getVariantId('Kopi Kapal Api Sachet'),
      qty: 1,
      unit_price: 2000,
    },

    // Free item reward for INV-20260702-001 (buy Indomie Box, get 1 Chitato free)
    {
      id: uuidv4(),
      transaction_promotion_id: getTpId('INV-20260702-001'),
      product_variant_id: getVariantId('Chitato 68gr'),
      qty: 1,
      unit_price: 12000,
    },

    // Free item reward for INV-20260702-002 (Member promo - free 1 Teh Botol)
    {
      id: uuidv4(),
      transaction_promotion_id: getTpId('INV-20260702-002'),
      product_variant_id: getVariantId('Teh Botol 350ml'),
      qty: 1,
      unit_price: 5000,
    },
  ]);
}