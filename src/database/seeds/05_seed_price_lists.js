const { v4: uuidv4 } = require('uuid');

exports.seed = async function (knex) {
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
};