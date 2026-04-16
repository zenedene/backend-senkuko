exports.up = function (knex) {
  return knex.schema.createTable('promotions', (table) => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.string('code').notNullable().unique();
    table.string('type').notNullable();
    table.text('description').nullable();
    table.timestamp('valid_from').nullable();
    table.timestamp('valid_to').nullable();
    table.integer('usage_limit').defaultTo(0);
    table.integer('usage_count').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.boolean('stackable').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('promotions');
};