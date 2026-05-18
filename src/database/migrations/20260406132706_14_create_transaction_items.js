export const up = function (knex) {
  return knex.schema.createTable('transaction_items', (table) => {
    table.uuid('id').primary();
    table.uuid('transaction_id').notNullable();
    table.uuid('product_variant_id').notNullable();
    table.uuid('price_list_id').notNullable();
    table.integer('qty').notNullable();
    table.decimal('unit_price', 15, 2).notNullable();
    table.decimal('original_price', 15, 2).notNullable();
    table.decimal('discount_amount', 15, 2).defaultTo(0);
    table.decimal('subtotal', 15, 2).notNullable();
    table.foreign('transaction_id').references('id').inTable('transactions').onDelete('CASCADE');
    table.foreign('product_variant_id').references('id').inTable('product_variants').onDelete('RESTRICT');
    table.foreign('price_list_id').references('id').inTable('price_lists').onDelete('RESTRICT');
  });
};
export const down = function (knex) {
  return knex.schema.dropTableIfExists('transaction_items');
};