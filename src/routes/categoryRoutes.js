import { body, validationResult } from "express-validator";
import express from "express";
import authMiddleware, { authorizeRole } from "../auth/authMiddleware.js";
import categoryController from "../controllers/categoryController.js";
const router = express.Router();

router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);
router.get("/:id/children", categoryController.getWithChildren);
router.post(
  "/",
  authMiddleware,
  authorizeRole("admin"),
  body("name").isString().notEmpty(),
  body("slug").isString().notEmpty(),
  body("parent_id").optional().isUUID(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Invalid input", errors: errors.array() });
    }
    return categoryController.create(req, res);
  }
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  body("name").optional().isString(),
  body("slug").optional().isString(),
  body("parent_id").optional().isUUID(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Invalid input", errors: errors.array() });
    }
    return categoryController.update(req, res);
  }
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  categoryController.remove,
);

export default router;
