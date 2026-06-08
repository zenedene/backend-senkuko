import express from "express";
import authController from "../auth/authController.js";
import adminController from "../auth/adminController.js";
import authMiddleware from "../auth/authMiddleware.js";
import { authorizeRole } from "../auth/authMiddleware.js";

const router = express.Router();

router.post("/login", authController.login);
router.post("/login/admin", adminController.login);
router.get("/me", authMiddleware, authController.me);

// Admin routes
router.post(
  "/admin/customers",
  authMiddleware,
  authorizeRole("admin"),
  adminController.addCustomer,
);

export default router;
