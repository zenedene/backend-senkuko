exports.up = function (knex) {
  return knex.schema.createTable('free_item_rewards', (table) => {
    table.uuid('id').primary();
    table.uuid('transaction_promotion_id').notNullable();
    table.uuid('product_variant_id').notNullable();
    table.integer('qty').notNullable();
    table.decimal('unit_price', 15, 2).defaultTo(0);

    table.foreign('transaction_promotion_id').references('id').inTable('transaction_promotions').onDelete('CASCADE');
    table.foreign('product_variant_id').references('id').inTable('product_variants').onDelete('RESTRICT');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('free_item_rewards');
};