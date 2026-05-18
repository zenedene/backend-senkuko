// 04_price_lists.js
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex) {
  // Remove old price‑list data first
  await knex('product_prices').del();
  await knex('price_lists').del();

  await knex('price_lists').insert([
    {
      id: uuidv4(),
      name: 'Harga Normal',
      code: 'NORMAL',
      description: 'Harga jual standar untuk umum',
      is_active: true,
    },
    {
      id: uuidv4(),
      name: 'Harga Grosir',
      code: 'GROSIR',
      description: 'Harga khusus pembelian dalam jumlah besar',
      is_active: true,
    },
    {
      id: uuidv4(),
      name: 'Harga Member',
      code: 'MEMBER',
      description: 'Harga khusus pelanggan member',
      is_active: true,
    },
  ]);
}
