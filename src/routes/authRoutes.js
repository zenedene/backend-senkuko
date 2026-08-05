import { body, validationResult } from "express-validator";
import authController from "../auth/authController.js";
import adminController from "../auth/adminController.js";
import authMiddleware from "../auth/authMiddleware.js";
import { authorizeRole } from "../auth/authMiddleware.js";
import express from "express";


const router = express.Router();

router.post(
  "/login",
  body("code").isString().notEmpty(),
  body("name").isString().notEmpty(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Invalid input", errors: errors.array() });
    }
    return authController.login(req, res);
  }
);
router.post(
  "/login/admin",
  body("name").isString().notEmpty(),
  body("password").isString().notEmpty(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Invalid input", errors: errors.array() });
    }
    return adminController.login(req, res);
  }
);
router.get("/me", authMiddleware, authController.me);

// Admin routes
router.post(
  "/admin/customers",
  authMiddleware,
  authorizeRole("admin"),
  body("name").isString().notEmpty(),
  body("phone").isString().notEmpty(),
  body("code").isString().notEmpty(),
  body("customer_group").isString().notEmpty(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Invalid input", errors: errors.array() });
    }
    return adminController.addCustomer(req, res);
  }
);

export default router;
