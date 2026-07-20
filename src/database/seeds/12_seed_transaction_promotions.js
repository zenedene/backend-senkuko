// 11_transaction_promotions.js
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex) {
  await knex('free_item_rewards').del();
  await knex('transaction_promotions').del();

  const transactions = await knex('transactions').select('id', 'invoice_number');
  const promotions = await knex('promotions').select('id', 'code');
  const vouchers = await knex('vouchers').select('id', 'code');

  const getTxnId = inv => transactions.find(t => t.invoice_number === inv)?.id;
  const getPromoId = code => promotions.find(p => p.code === code)?.id;
  const getVoucherId = code => vouchers.find(v => v.code === code)?.id;

  await knex('transaction_promotions').insert([
    // INV-20260701-001 (Budi completed) - Diskon Akhir Bulan 10% = 1300
    {
      id: uuidv4(),
      transaction_id: getTxnId('INV-20260701-001'),
      promotion_id: getPromoId('AKHIRBULAN'),
      voucher_id: getVoucherId('VOU-AKHIRBULAN-001'),
      discount_given: 1300,
      applied_rewards: JSON.stringify({ type: 'discount_percent', value: 10, subtotal: 13000 }),
    },

    // INV-20260702-001 (Agus pending) - Diskon Akhir Bulan 10% = 33200
    {
      id: uuidv4(),
      transaction_id: getTxnId('INV-20260702-001'),
      promotion_id: getPromoId('AKHIRBULAN'),
      voucher_id: getVoucherId('VOU-AKHIRBULAN-002'),
      discount_given: 33200,
      applied_rewards: JSON.stringify({ type: 'discount_percent', value: 10, subtotal: 332000 }),
    },
  ]);
}