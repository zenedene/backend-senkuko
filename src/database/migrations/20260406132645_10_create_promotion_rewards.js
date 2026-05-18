export const up = function (knex) {
  return knex.schema.createTable('promotion_rewards', (table) => {
    table.uuid('id').primary();
    table.uuid('promotion_id').notNullable();
    table.string('reward_type').notNullable();
    table.decimal('discount_value', 15, 2).defaultTo(0);
    table.string('discount_mode').nullable();
    table.uuid('free_variant_id').nullable();
    table.integer('free_qty').defaultTo(0);
    table.decimal('max_discount_amount', 15, 2).defaultTo(0);
    table.text('metadata').nullable();
    table.foreign('promotion_id').references('id').inTable('promotions').onDelete('CASCADE');
    table.foreign('free_variant_id').references('id').inTable('product_variants').onDelete('SET NULL');
  });
};
export const down = function (knex) {
  return knex.schema.dropTableIfExists('promotion_rewards');
};