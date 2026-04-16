exports.up = function (knex) {
  return knex.schema.createTable('customers', (table) => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.string('phone').nullable();
    table.string('email').nullable();
    table.string('member_type').defaultTo('regular');
    table.decimal('total_spend', 15, 2).defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('customers');
};