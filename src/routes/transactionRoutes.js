import express from "express";
import authMiddleware, { authorizeRole } from "../auth/authMiddleware.js";
import transactionController from "../controllers/transactionController.js";

const router = express.Router();

router.post("/webhook", transactionController.webhook);

router.post("/", authMiddleware, transactionController.create);

router.get(
  "/",
  authMiddleware,
  authorizeRole("admin"),
  transactionController.getAll,
);

router.get("/:id", authMiddleware, transactionController.getById);

router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRole("admin"),
  transactionController.updateStatus,
);

export default router;
