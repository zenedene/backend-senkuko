import express from "express";
import authMiddleware, { authorizeRole } from "../auth/authMiddleware.js";
import unitController from "../controllers/unitController.js";
const router = express.Router();

router.get("/", unitController.getAll);
router.get("/:id", unitController.getById);
router.post("/", authMiddleware, authorizeRole("admin"), unitController.create);
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  unitController.update,
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  unitController.remove,
);

export default router;
