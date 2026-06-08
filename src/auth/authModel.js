import pool from "../config/database.js";

const PUBLIC_FIELDS = [
  "id",
  "code",
  "name",
  "phone",
  "email",
  "total_spend",
  "status",
  "created_at",
];

const findByCodeAndName = async (code, name) => {
  const [rows] = await pool.query(
    `
    SELECT ${PUBLIC_FIELDS.join(", ")}
    FROM customers
    WHERE code = ? AND name = ?
    LIMIT 1
  `,
    [code, name],
  );
  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT ${PUBLIC_FIELDS.join(", ")}
    FROM customers
    WHERE id = ?
  `,
    [id],
  );
  return rows[0] || null;
};

const authModel = {
  findByCodeAndName,
  findById,
};

export default authModel;
