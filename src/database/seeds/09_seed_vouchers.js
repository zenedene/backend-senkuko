// 08_vouchers.js
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex) {
  await knex('vouchers').del();

  const promotions = await knex('promotions').select('id', 'code');
  const getPromoId = code => promotions.find(p => p.code === code)?.id;

  await knex('vouchers').insert([
    {
      id: uuidv4(),
      promotion_id: getPromoId('AKHIRBULAN'),
      code: 'VOU-AKHIRBULAN-001',
      status: 'claimed',
      claimed_by: null,
      claimed_at: new Date('2026-07-01T10:30:00'),
      usage_limit: 1,
      usage_count: 1,
    },
    {
      id: uuidv4(),
      promotion_id: getPromoId('AKHIRBULAN'),
      code: 'VOU-AKHIRBULAN-002',
      status: 'active',
      claimed_by: null,
      claimed_at: null,
      usage_limit: 1,
      usage_count: 0,
    },
    {
      id: uuidv4(),
      promotion_id: getPromoId('AKHIRBULAN'),
      code: 'VOU-AKHIRBULAN-003',
      status: 'active',
      claimed_by: null,
      claimed_at: null,
      usage_limit: 1,
      usage_count: 0,
    },
    {
      id: uuidv4(),
      promotion_id: getPromoId('MEMBER10'),
      code: 'VOU-MEMBER10-001',
      status: 'active',
      claimed_by: null,
      claimed_at: null,
      usage_limit: 1,
      usage_count: 0,
    },
    {
      id: uuidv4(),
      promotion_id: getPromoId('MEMBER10'),
      code: 'VOU-MEMBER10-002',
      status: 'active',
      claimed_by: null,
      claimed_at: null,
      usage_limit: 1,
      usage_count: 0,
    },
  ]);
}