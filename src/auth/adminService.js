import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import adminModel from "./adminModel.js";
import customerService from "../services/customerService.js";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

const createToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const login = async (data) => {
  const { name, password } = data;

  if (!name) throw new Error("Name is required");
  if (!password) throw new Error("Password is required");

  const admin = await adminModel.findByName(name);
  if (!admin) throw new Error("Name or password is invalid");
  if (admin.status !== "active") throw new Error("Admin account is not active");

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) throw new Error("Email or password is invalid");

  const token = createToken({
    id: admin.id,
    name: admin.name,
    role: "admin",
    status: admin.status,
  });

  return {
    token,
    user: {
      id: admin.id,
      name: admin.name,
      status: admin.status,
      created_at: admin.created_at,
      role: "admin",
    },
  };
};

const addCustomer = async (data) => {
  // Validate required fields for admin
  if (!data.name || data.name.trim() === "") {
    throw new Error("Name is required");
  }
  if (!data.phone || data.phone.trim() === "") {
    throw new Error("Phone is required");
  }
  if (!data.code || data.code.trim() === "") {
    throw new Error("Code is required");
  }
  if (!data.customer_group || data.customer_group.trim() === "") {
    throw new Error("Customer group is required");
  }

  // Use existing customer service to create customer
  return await customerService.createCustomer(data);
};

export default {
  login,
  addCustomer,
};
