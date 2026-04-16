const { v4: uuidv4 } = require('uuid');

exports.seed = async function (knex) {
  await knex('transactions').del();
  await knex('customers').del();

  await knex('customers').insert([
    { id: uuidv4(), name: 'Budi Santoso', phone: '081234567890', email: 'budi@email.com', member_type: 'member', total_spend: 0, created_at: new Date() },
    { id: uuidv4(), name: 'Siti Aminah', phone: '082345678901', email: 'siti@email.com', member_type: 'member', total_spend: 0, created_at: new Date() },
    { id: uuidv4(), name: 'Agus Wijaya', phone: '083456789012', email: null, member_type: 'regular', total_spend: 0, created_at: new Date() },
    { id: uuidv4(), name: 'Dewi Kusuma', phone: '084567890123', email: 'dewi@email.com', member_type: 'vip', total_spend: 0, created_at: new Date() },
    { id: uuidv4(), name: 'Rudi Hermawan', phone: null, email: null, member_type: 'regular', total_spend: 0, created_at: new Date() },
  ]);
};