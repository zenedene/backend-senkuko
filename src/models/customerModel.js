import pool from "../config/database.js";

const findAll = async () => {
  const [rows] = await pool.query(`
    SELECT id, code, name, address, city, phone, email, customer_group, region, subregion, total_spend, status, created_at
    FROM customers
    ORDER BY created_at DESC
  `);
  return rows;
};

const findByStatus = async (status) => {
  const [rows] = await pool.query(
    `
    SELECT id, code, name, address, city, phone, email, customer_group, region, subregion, total_spend, status, created_at
    FROM customers
    WHERE status = ?
    ORDER BY created_at DESC
  `,
    [status],
  );
  return rows;
};

const updateStatus = async (id, status) => {
  await pool.query(
    `
    UPDATE customers SET status = ? WHERE id = ?
  `,
    [status, id],
  );
  return findById(id);
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT id, code, name, address, city, phone, email, customer_group, region, subregion, total_spend, status, created_at
    FROM customers
    WHERE id = ?
  `,
    [id],
  );
  return rows[0] || null;
};

const findByPhone = async (phone) => {
  const [rows] = await pool.query(
    `
    SELECT id, code, name, address, city, phone, email, customer_group, region, subregion, total_spend, status, created_at
    FROM customers
    WHERE phone = ?
  `,
    [phone],
  );
  return rows[0] || null;
};

const findByEmail = async (email) => {
  const [rows] = await pool.query(
    `
    SELECT id, code, name, address, city, phone, email, customer_group, region, subregion, total_spend, status, created_at
    FROM customers
    WHERE email = ?
  `,
    [email],
  );
  return rows[0] || null;
};

const create = async (data) => {
  const {
    id,
    code,
    name,
    address,
    city,
    phone,
    email,
    customer_group,
    region,
    subregion,
    total_spend,
    status,
  } = data;
  await pool.query(
    `
    INSERT INTO customers (id, code, name, address, city, phone, email, customer_group, region, subregion, total_spend, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `,
    [
      id,
      code ?? null,
      name,
      address ?? null,
      city ?? null,
      phone ?? null,
      email ?? null,
      customer_group ?? "General",
      region ?? null,
      subregion ?? null,
      total_spend ?? 0,
      status ?? "active",
    ],
  );
  return findById(id);
};

const update = async (id, data) => {
  const {
    name,
    phone,
    email,
    code,
    address,
    city,
    customer_group,
    region,
    subregion,
    status,
  } = data;
  await pool.query(
    `
    UPDATE customers
    SET code = ?, name = ?, address = ?, city = ?, phone = ?, email = ?, customer_group = ?, region = ?, subregion = ?, status = ?
    WHERE id = ?
  `,
    [
      code ?? null,
      name,
      address ?? null,
      city ?? null,
      phone ?? null,
      email ?? null,
      customer_group ?? "General",
      region ?? null,
      subregion ?? null,
      status ?? "active",
      id,
    ],
  );
  return findById(id);
};

const updateTotalSpend = async (id, amount) => {
  await pool.query(
    `
    UPDATE customers
    SET total_spend = total_spend + ?
    WHERE id = ?
  `,
    [amount, id],
  );
  return findById(id);
};

const remove = async (id) => {
  const [result] = await pool.query(`DELETE FROM customers WHERE id = ?`, [id]);
  return result.affectedRows;
};

const customerModel = {
  findAll,
  findById,
  findByPhone,
  findByEmail,
  findByStatus,
  create,
  update,
  updateStatus,
  updateTotalSpend,
  remove,
};
export default customerModel;
