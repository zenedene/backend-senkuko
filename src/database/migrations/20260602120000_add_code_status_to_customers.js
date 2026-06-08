export const up = async function (knex) {
  const hasCode = await knex.schema.hasColumn("customers", "code");
  if (!hasCode) {
    await knex.schema.alterTable("customers", (table) => {
      table.string("code").nullable().unique();
    });
  }

  return knex.raw(
    `UPDATE customers
     SET code = CONCAT('CUST-', LEFT(REPLACE(id, '-', ''), 8))
     WHERE code IS NULL OR code = '';
    `,
  );
};

export const down = function (knex) {
  return knex.schema.alterTable("customers", (table) => {
    table.dropColumn("code");
  });
};
