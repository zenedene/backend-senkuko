const { v4: uuidv4 } = require('uuid');

exports.seed = async function (knex) {
await knex('product_variants').del();
  await knex('units').del();

  await knex('units').insert([
    { id: uuidv4(), name: 'Pieces', symbol: 'pcs', description: 'Satuan buah' },
    { id: uuidv4(), name: 'Box', symbol: 'box', description: 'Satuan kardus' },
    { id: uuidv4(), name: 'Lusin', symbol: 'lsn', description: 'Satuan 12 buah' },
    { id: uuidv4(), name: 'Kilogram', symbol: 'kg', description: 'Satuan berat' },
    { id: uuidv4(), name: 'Gram', symbol: 'gr', description: 'Satuan berat kecil' },
    { id: uuidv4(), name: 'Liter', symbol: 'ltr', description: 'Satuan volume' },
    { id: uuidv4(), name: 'Mililiter', symbol: 'ml', description: 'Satuan volume kecil' },
  ]);
};