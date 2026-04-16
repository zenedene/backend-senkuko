exports.up = function (knex) {
  return knex.schema.createTable('categories', (table) => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.string('slug').notNullable().unique();
    table.uuid('parent_id').nullable();
    table.integer('sort_order').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.foreign('parent_id').references('id').inTable('categories').onDelete('SET NULL');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('categories');
};