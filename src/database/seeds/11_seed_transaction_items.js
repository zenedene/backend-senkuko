// 10_transaction_items.js
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex) {
  await knex('transaction_item_promotions').del();
  await knex('free_item_rewards').del();
  await knex('transaction_items').del();

  const transactions = await knex('transactions').select('id', 'invoice_number');
  const variants = await knex('product_variants').select('id', 'name');
  const priceLists = await knex('price_lists').select('id', 'code');

  const getTxnId = inv => transactions.find(t => t.invoice_number === inv)?.id;
  const getVariantId = name => variants.find(v => v.name === name)?.id;
  const getPriceListId = code => priceLists.find(p => p.code === code)?.id;

  await knex('transaction_items').insert([
    // INV-20260701-001 (Budi) - Aqua 2x@4000 + Teh Botol 1x@5000 = 13000
    {
      id: uuidv4(),
      transaction_id: getTxnId('INV-20260701-001'),
      product_variant_id: getVariantId('Aqua 600ml'),
      price_list_id: getPriceListId('NORMAL'),
      qty: 2,
      unit_price: 4000,
      original_price: 4000,
      discount_amount: 0,
      subtotal: 8000,
    },
    {
      id: uuidv4(),
      transaction_id: getTxnId('INV-20260701-001'),
      product_variant_id: getVariantId('Teh Botol 350ml'),
      price_list_id: getPriceListId('NORMAL'),
      qty: 1,
      unit_price: 5000,
      original_price: 5000,
      discount_amount: 0,
      subtotal: 5000,
    },

    // INV-20260701-002 (Siti) - Indomie 5x@3500 + Chitato 2x@12000 = 41500
    {
      id: uuidv4(),
      transaction_id: getTxnId('INV-20260701-002'),
      product_variant_id: getVariantId('Indomie Goreng'),
      price_list_id: getPriceListId('NORMAL'),
      qty: 5,
      unit_price: 3500,
      original_price: 3500,
      discount_amount: 0,
      subtotal: 17500,
    },
    {
      id: uuidv4(),
      transaction_id: getTxnId('INV-20260701-002'),
      product_variant_id: getVariantId('Chitato 68gr'),
      price_list_id: getPriceListId('NORMAL'),
      qty: 2,
      unit_price: 12000,
      original_price: 12000,
      discount_amount: 0,
      subtotal: 24000,
    },

    // INV-20260701-003 (Walk-in) - Kopi 3x@2000 + Aqua 2x@4000 = 14000
    {
      id: uuidv4(),
      transaction_id: getTxnId('INV-20260701-003'),
      product_variant_id: getVariantId('Kopi Kapal Api Sachet'),
      price_list_id: getPriceListId('NORMAL'),
      qty: 3,
      unit_price: 2000,
      original_price: 2000,
      discount_amount: 0,
      subtotal: 6000,
    },
    {
      id: uuidv4(),
      transaction_id: getTxnId('INV-20260701-003'),
      product_variant_id: getVariantId('Aqua 600ml'),
      price_list_id: getPriceListId('NORMAL'),
      qty: 2,
      unit_price: 4000,
      original_price: 4000,
      discount_amount: 0,
      subtotal: 8000,
    },

    // INV-20260702-001 (Agus - pending) - Indomie Box 2x@125000 + Aqua Box 1x@82000 = 332000
    {
      id: uuidv4(),
      transaction_id: getTxnId('INV-20260702-001'),
      product_variant_id: getVariantId('Indomie Goreng (Box)'),
      price_list_id: getPriceListId('GROSIR'),
      qty: 2,
      unit_price: 125000,
      original_price: 125000,
      discount_amount: 0,
      subtotal: 250000,
    },
    {
      id: uuidv4(),
      transaction_id: getTxnId('INV-20260702-001'),
      product_variant_id: getVariantId('Aqua 600ml (Box)'),
      price_list_id: getPriceListId('GROSIR'),
      qty: 1,
      unit_price: 82000,
      original_price: 82000,
      discount_amount: 0,
      subtotal: 82000,
    },

    // INV-20260702-002 (Dewi - cancelled) - Teh Botol 3x@4500 + Kopi 5x@1700 = 22000
    {
      id: uuidv4(),
      transaction_id: getTxnId('INV-20260702-002'),
      product_variant_id: getVariantId('Teh Botol 350ml'),
      price_list_id: getPriceListId('MEMBER'),
      qty: 3,
      unit_price: 4500,
      original_price: 4500,
      discount_amount: 0,
      subtotal: 13500,
    },
    {
      id: uuidv4(),
      transaction_id: getTxnId('INV-20260702-002'),
      product_variant_id: getVariantId('Kopi Kapal Api Sachet'),
      price_list_id: getPriceListId('GROSIR'),
      qty: 5,
      unit_price: 1700,
      original_price: 1700,
      discount_amount: 0,
      subtotal: 8500,
    },
  ]);
}