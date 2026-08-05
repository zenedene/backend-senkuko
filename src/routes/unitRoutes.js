import { body, validationResult } from "express-validator";
import express from "express";
import authMiddleware, { authorizeRole } from "../auth/authMiddleware.js";
import unitController from "../controllers/unitController.js";
const router = express.Router();

router.get("/", unitController.getAll);
router.get("/:id", unitController.getById);
router.post(
  "/",
  authMiddleware,
  authorizeRole("admin"),
  body("name").isString().notEmpty(),
  body("symbol").isString().notEmpty(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Invalid input", errors: errors.array() });
    }
    return unitController.create(req, res);
  }
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  body("name").optional().isString(),
  body("symbol").optional().isString(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Invalid input", errors: errors.array() });
    }
    return unitController.update(req, res);
  }
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  unitController.remove,
);

export default router;
