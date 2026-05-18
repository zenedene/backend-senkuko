export const up = function (knex) {
  return knex.schema.createTable('transaction_item_promotions', (table) => {
    table.uuid('id').primary();
    table.uuid('transaction_item_id').notNullable();
    table.uuid('promotion_id').notNullable();
    table.decimal('discount_amount', 15, 2).defaultTo(0);
    table.text('reward_detail').nullable();
    table.foreign('transaction_item_id').references('id').inTable('transaction_items').onDelete('CASCADE');
    table.foreign('promotion_id').references('id').inTable('promotions').onDelete('RESTRICT');
  });
};
export const down = function (knex) {
  return knex.schema.dropTableIfExists('transaction_item_promotions');
};