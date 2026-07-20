// 12_transaction_item_promotions.js
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex) {
  await knex('transaction_item_promotions').del();

  const transactionItems = await knex('transaction_items')
    .join('transactions', 'transaction_items.transaction_id', 'transactions.id')
    .join('product_variants', 'transaction_items.product_variant_id', 'product_variants.id')
    .select('transaction_items.id as item_id', 'transactions.invoice_number', 'product_variants.name as variant_name');

  const promotions = await knex('promotions').select('id', 'code');

  const getItemId = (inv, variant) => transactionItems.find(t => t.invoice_number === inv && t.variant_name === variant)?.item_id;
  const getPromoId = code => promotions.find(p => p.code === code)?.id;

  await knex('transaction_item_promotions').insert([
    // INV-20260701-001 (Budi) - Diskon Akhir Bulan 10% on Aqua 600ml
    {
      id: uuidv4(),
      transaction_item_id: getItemId('INV-20260701-001', 'Aqua 600ml'),
      promotion_id: getPromoId('AKHIRBULAN'),
      discount_amount: 760,
      reward_detail: JSON.stringify({ type: 'discount_percent', value: 10, original_price: 7600 }),
    },
    // INV-20260701-001 (Budi) - Diskon Akhir Bulan 10% on Teh Botol
    {
      id: uuidv4(),
      transaction_item_id: getItemId('INV-20260701-001', 'Teh Botol 350ml'),
      promotion_id: getPromoId('AKHIRBULAN'),
      discount_amount: 450,
      reward_detail: JSON.stringify({ type: 'discount_percent', value: 10, original_price: 4500 }),
    },

    // INV-20260701-003 (Walk-in) - Member discount on Kopi
    {
      id: uuidv4(),
      transaction_item_id: getItemId('INV-20260701-003', 'Kopi Kapal Api Sachet'),
      promotion_id: getPromoId('MEMBER10'),
      discount_amount: 600,
      reward_detail: JSON.stringify({ type: 'discount_fixed', value: 10000, applied_to_item: true }),
    },
    // INV-20260701-003 (Walk-in) - Member discount on Aqua
    {
      id: uuidv4(),
      transaction_item_id: getItemId('INV-20260701-003', 'Aqua 600ml'),
      promotion_id: getPromoId('MEMBER10'),
      discount_amount: 800,
      reward_detail: JSON.stringify({ type: 'discount_fixed', value: 10000, applied_to_item: true }),
    },

    // INV-20260702-001 (Agus) - Diskon Akhir Bulan 10% on Indomie Box
    {
      id: uuidv4(),
      transaction_item_id: getItemId('INV-20260702-001', 'Indomie Goreng (Box)'),
      promotion_id: getPromoId('AKHIRBULAN'),
      discount_amount: 12500,
      reward_detail: JSON.stringify({ type: 'discount_percent', value: 10, original_price: 125000 }),
    },
    // INV-20260702-001 (Agus) - Diskon Akhir Bulan 10% on Aqua Box
    {
      id: uuidv4(),
      transaction_item_id: getItemId('INV-20260702-001', 'Aqua 600ml (Box)'),
      promotion_id: getPromoId('AKHIRBULAN'),
      discount_amount: 8200,
      reward_detail: JSON.stringify({ type: 'discount_percent', value: 10, original_price: 82000 }),
    },

    // INV-20260702-002 (Dewi) - Member discount on Teh Botol
    {
      id: uuidv4(),
      transaction_item_id: getItemId('INV-20260702-002', 'Teh Botol 350ml'),
      promotion_id: getPromoId('MEMBER10'),
      discount_amount: 1350,
      reward_detail: JSON.stringify({ type: 'discount_fixed', value: 10000, applied_to_item: true }),
    },
    // INV-20260702-002 (Dewi) - Member discount on Kopi
    {
      id: uuidv4(),
      transaction_item_id: getItemId('INV-20260702-002', 'Kopi Kapal Api Sachet'),
      promotion_id: getPromoId('MEMBER10'),
      discount_amount: 850,
      reward_detail: JSON.stringify({ type: 'discount_fixed', value: 10000, applied_to_item: true }),
    },
  ]);
}