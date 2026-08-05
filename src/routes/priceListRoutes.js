import { body, validationResult } from "express-validator";
import express from "express";
import authMiddleware, { authorizeRole } from "../auth/authMiddleware.js";
import priceListController from "../controllers/priceListController.js";
const router = express.Router();

router.get("/", priceListController.getAll);
router.get("/:id", priceListController.getById);
router.post(
  "/",
  authMiddleware,
  authorizeRole("admin"),
  body("name").isString().notEmpty(),
  body("code").isString().notEmpty(),
  body("is_active").optional().isBoolean(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Invalid input", errors: errors.array() });
    }
    return priceListController.create(req, res);
  }
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  body("name").optional().isString(),
  body("code").optional().isString(),
  body("is_active").optional().isBoolean(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Invalid input", errors: errors.array() });
    }
    return priceListController.update(req, res);
  }
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  priceListController.remove,
);

export default router;
