import pool from "../config/database.js";

const PUBLIC_FIELDS = [
  "id",
  "username",
  "name",
  "email",
  "status",
  "created_at",
];

const findByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT * FROM admins WHERE email = ? LIMIT 1`,
    [email],
  );
  return rows[0] || null;
};

const findByName = async (name) => {
  const [rows] = await pool.query(
    `SELECT * FROM admins WHERE name = ? LIMIT 1`,
    [name],
  );
  return rows[0] || null;
};

const findByUsername = async (username) => {
  const [rows] = await pool.query(
    `SELECT * FROM admins WHERE username = ? LIMIT 1`,
    [username],
  );
  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT ${PUBLIC_FIELDS.join(", ")}
    FROM admins
    WHERE id = ?
    LIMIT 1
  `,
    [id],
  );
  return rows[0] || null;
};

const adminModel = {
  findByEmail,
  findByName,
  findByUsername,
  findById,
};

export default adminModel;
