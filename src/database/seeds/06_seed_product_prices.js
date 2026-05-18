// 05_product_prices.js
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex) {
  // Ensure the price‑list table is seeded first
  await knex('product_prices').del();

  const variants   = await knex('product_variants').select('id', 'name');
  const priceLists = await knex('price_lists').select('id', 'code');

  const getVariantId   = name => variants.find(v => v.name === name)?.id;
  const getPriceListId = code => priceLists.find(p => p.code === code)?.id;

  await knex('product_prices').insert([
    // ---------- Aqua 600ml ----------
    { id: uuidv4(), product_variant_id: getVariantId('Aqua 600ml'),         price_list_id: getPriceListId('NORMAL'),  min_qty: 1,  price: 4000,  valid_from: null, valid_to: null, is_active: true },
    { id: uuidv4(), product_variant_id: getVariantId('Aqua 600ml'),         price_list_id: getPriceListId('GROSIR'), min_qty: 24, price: 3500,  valid_from: null, valid_to: null, is_active: true },
    { id: uuidv4(), product_variant_id: getVariantId('Aqua 600ml'),         price_list_id: getPriceListId('MEMBER'), min_qty: 1,  price: 3800,  valid_from: null, valid_to: null, is_active: true },

    // ---------- Aqua Box ----------
    { id: uuidv4(), product_variant_id: getVariantId('Aqua 600ml (Box)'),   price_list_id: getPriceListId('NORMAL'),  min_qty: 1,  price: 90000, valid_from: null, valid_to: null, is_active: true },
    { id: uuidv4(), product_variant_id: getVariantId('Aqua 600ml (Box)'),   price_list_id: getPriceListId('GROSIR'), min_qty: 5,  price: 82000, valid_from: null, valid_to: null, is_active: true },

    // ---------- Teh Botol ----------
    { id: uuidv4(), product_variant_id: getVariantId('Teh Botol 350ml'),   price_list_id: getPriceListId('NORMAL'),  min_qty: 1,  price: 5000,  valid_from: null, valid_to: null, is_active: true },
    { id: uuidv4(), product_variant_id: getVariantId('Teh Botol 350ml'),   price_list_id: getPriceListId('MEMBER'), min_qty: 1,  price: 4500,  valid_from: null, valid_to: null, is_active: true },

    // ---------- Kopi Kapal Api ----------
    { id: uuidv4(), product_variant_id: getVariantId('Kopi Kapal Api Sachet'), price_list_id: getPriceListId('NORMAL'),  min_qty: 1, price: 2000, valid_from: null, valid_to: null, is_active: true },
    { id: uuidv4(), product_variant_id: getVariantId('Kopi Kapal Api Sachet'), price_list_id: getPriceListId('GROSIR'), min_qty: 10, price: 1700, valid_from: null, valid_to: null, is_active: true },

    // ---------- Indomie Goreng ----------
    { id: uuidv4(), product_variant_id: getVariantId('Indomie Goreng'),    price_list_id: getPriceListId('NORMAL'),  min_qty: 1,  price: 3500,  valid_from: null, valid_to: null, is_active: true },
    { id: uuidv4(), product_variant_id: getVariantId('Indomie Goreng'),    price_list_id: getPriceListId('GROSIR'), min_qty: 40, price: 3000,  valid_from: null, valid_to: null, is_active: true },
    { id: uuidv4(), product_variant_id: getVariantId('Indomie Goreng'),    price_list_id: getPriceListId('MEMBER'), min_qty: 1,  price: 3200,  valid_from: null, valid_to: null, is_active: true },

    // ---------- Indomie Box ----------
    { id: uuidv4(), product_variant_id: getVariantId('Indomie Goreng (Box)'), price_list_id: getPriceListId('NORMAL'), min_qty: 1, price: 135000, valid_from: null, valid_to: null, is_active: true },
    { id: uuidv4(), product_variant_id: getVariantId('Indomie Goreng (Box)'), price_list_id: getPriceListId('GROSIR'), min_qty: 5, price: 125000, valid_from: null, valid_to: null, is_active: true },

    // ---------- Chitato ----------
    { id: uuidv4(), product_variant_id: getVariantId('Chitato 68gr'),      price_list_id: getPriceListId('NORMAL'),  min_qty: 1, price: 12000, valid_from: null, valid_to: null, is_active: true },
    { id: uuidv4(), product_variant_id: getVariantId('Chitato 68gr'),      price_list_id: getPriceListId('MEMBER'),  min_qty: 1, price: 11000, valid_from: null, valid_to: null, is_active: true },
  ]);
}
