exports.up = function (knex) {
  return knex.schema.createTable('vouchers', (table) => {
    table.uuid('id').primary();
    table.uuid('promotion_id').notNullable();
    table.string('code').notNullable().unique();
    table.string('status').defaultTo('active');
    table.uuid('claimed_by').nullable();
    table.timestamp('claimed_at').nullable();
    table.integer('usage_limit').defaultTo(1);
    table.integer('usage_count').defaultTo(0);

    table.foreign('promotion_id').references('id').inTable('promotions').onDelete('CASCADE');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('vouchers');
};