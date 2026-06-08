export const up = function (knex) {
  return knex.schema.alterTable("customers", (table) => {
    table.dropColumn("member_type");
  });
};

export const down = function (knex) {
  return knex.schema.alterTable("customers", (table) => {
    table.string("member_type").defaultTo("regular");
  });
};
