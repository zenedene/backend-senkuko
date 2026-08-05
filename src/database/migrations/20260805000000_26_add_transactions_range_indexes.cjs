exports.up = function (knex) {
  return knex.schema.alterTable("transactions", (table) => {
    table.index(["created_at"], "transactions_created_at_index");
    table.index(["customer_id", "created_at"], "transactions_customer_created_at_index");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("transactions", (table) => {
    table.dropIndex(["created_at"], "transactions_created_at_index");
    table.dropIndex(["customer_id", "created_at"], "transactions_customer_created_at_index");
  });
};
