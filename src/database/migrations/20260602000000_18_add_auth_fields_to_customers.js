export const up = function (knex) {
  return knex.schema.alterTable("customers", (table) => {
    table.string("password").nullable();
  });
};

export const down = function (knex) {
  return knex.schema.alterTable("customers", (table) => {
    table.dropColumn("password");
  });
};
