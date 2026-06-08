import express from "express";
import authMiddleware, { authorizeRole } from "../auth/authMiddleware.js";
const router = express.Router();
import customerController from "../controllers/customerController.js";

router.get(
  "/",
  authMiddleware,
  authorizeRole("admin"),
  customerController.getAll,
);
router.get(
  "/by-status",
  authMiddleware,
  authorizeRole("admin"),
  customerController.getByStatus,
);
router.get(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  customerController.getById,
);
router.post(
  "/",
  authMiddleware,
  authorizeRole("admin"),
  customerController.create,
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  customerController.update,
);
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRole("admin"),
  customerController.updateStatus,
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  customerController.remove,
);

export default router;
