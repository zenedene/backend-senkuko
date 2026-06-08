import express from "express";
import authMiddleware, { authorizeRole } from "../auth/authMiddleware.js";
const router = express.Router();
import categoryController from "../controllers/categoryController.js";

router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);
router.get("/:id/children", categoryController.getWithChildren);
router.post(
  "/",
  authMiddleware,
  authorizeRole("admin"),
  categoryController.create,
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  categoryController.update,
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  categoryController.remove,
);

export default router;
