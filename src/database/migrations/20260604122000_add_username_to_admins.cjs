exports.up = async function (knex) {
  const has = await knex.schema.hasColumn("admins", "username");
  if (!has) {
    await knex.schema.alterTable("admins", (table) => {
      table.string("username").nullable().unique();
    });

    // Populate username for existing admins to a deterministic value
    await knex.raw(
      `UPDATE admins
       SET username = CONCAT('admin-', LEFT(REPLACE(id, '-', ''), 8))
       WHERE username IS NULL OR username = '';
      `,
    );
  }
};

exports.down = async function (knex) {
  const has = await knex.schema.hasColumn("admins", "username");
  if (has) {
    await knex.schema.alterTable("admins", (table) => {
      table.dropColumn("username");
    });
  }
};
