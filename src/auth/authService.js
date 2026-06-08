import jwt from "jsonwebtoken";
import authModel from "./authModel.js";
import adminModel from "./adminModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

const createToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const login = async (data) => {
  const { code, name } = data;

  if (!code) throw new Error("Customer code is required");
  if (!name) throw new Error("Customer name is required");

  const user = await authModel.findByCodeAndName(code, name);
  if (!user) throw new Error("Code or name is invalid");
  if (user.status !== "active") throw new Error("Account is not active");

  const token = createToken({
    id: user.id,
    code: user.code,
    name: user.name,
    role: "customer",
    status: user.status,
  });

  return {
    token,
    user: {
      id: user.id,
      code: user.code,
      name: user.name,
      status: user.status,
      created_at: user.created_at,
      role: "customer",
    },
  };
};

const verifyToken = (token) => {
  if (!token) throw new Error("Token is required");
  return jwt.verify(token, JWT_SECRET);
};

const getProfile = async (id, role = "customer") => {
  if (role === "admin") {
    const admin = await adminModel.findById(id);
    if (!admin) throw new Error("Admin not found");
    return {
      ...admin,
      role: "admin",
    };
  }

  const user = await authModel.findById(id);
  if (!user) throw new Error("User not found");
  return {
    ...user,
    role: "customer",
  };
};

export default {
  login,
  verifyToken,
  getProfile,
};
