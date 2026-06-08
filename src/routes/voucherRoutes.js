import { Router } from "express";
import authMiddleware, { authorizeRole } from "../auth/authMiddleware.js";
import * as voucherController from "../controllers/voucherController.js";

const router = Router();

router.get("/", voucherController.getAll);
router.get("/:id", voucherController.getById);
router.post(
  "/",
  authMiddleware,
  authorizeRole("admin"),
  voucherController.create,
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  voucherController.update,
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  voucherController.remove,
);

export default router;
