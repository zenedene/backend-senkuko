// 12_transaction_item_promotions.js
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex) {
  await knex('transaction_item_promotions').del();
}