exports.up = function (knex) {
  return knex.schema.createTable('products', (table) => {
    table.uuid('id').primary();
    table.uuid('category_id').nullable();
    table.string('name').notNullable();
    table.string('sku_code').notNullable().unique();
    table.text('description').nullable();
    table.string('barcode').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.foreign('category_id').references('id').inTable('categories').onDelete('SET NULL');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('products');
};