// 13_free_item_rewards.js
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex) {
  await knex('free_item_rewards').del();
}