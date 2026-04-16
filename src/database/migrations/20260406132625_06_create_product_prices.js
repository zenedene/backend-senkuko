exports.up = function (knex) {
  return knex.schema.createTable('product_prices', (table) => {
    table.uuid('id').primary();
    table.uuid('product_variant_id').notNullable();
    table.uuid('price_list_id').notNullable();
    table.integer('min_qty').defaultTo(1);
    table.decimal('price', 15, 2).notNullable();
    table.timestamp('valid_from').nullable();
    table.timestamp('valid_to').nullable();
    table.boolean('is_active').defaultTo(true);

    table.foreign('product_variant_id').references('id').inTable('product_variants').onDelete('CASCADE');
    table.foreign('price_list_id').references('id').inTable('price_lists').onDelete('CASCADE');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('product_prices');
};