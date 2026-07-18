import express from "express";
import authMiddleware, { authorizeRole } from "../auth/authMiddleware.js";
import transactionController from "../controllers/transactionController.js";

const router = express.Router();

// ✅ WEBHOOK ROUTE - TANPA AUTH MIDDLEWARE!
router.post("/webhook/midtrans", (req, res, next) => {
  console.log("========== MIDTRANS WEBHOOK RECEIVED ==========");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Headers:", req.headers);
  console.log("Body:", JSON.stringify(req.body, null, 2));
  console.log("==============================================");
  next();
}, transactionController.webhook);

// ✅ TEST ENDPOINT
router.get("/webhook/test", (req, res) => {
  console.log("Webhook test accessed:", new Date().toISOString());
  res.json({ 
    status: "success", 
    message: "Webhook endpoint is working",
    timestamp: new Date().toISOString()
  });
});

// Routes dengan auth
router.post("/", authMiddleware, transactionController.create);

router.get(
  "/history",
  authMiddleware,
  authorizeRole("customer"),
  transactionController.getHistory,
);

router.get(
  "/",
  authMiddleware,
  authorizeRole("admin"),
  transactionController.getAll,
);

router.get(
  "/:id/check-payment",
  authMiddleware,
  transactionController.checkPayment
);

router.get("/:id", authMiddleware, transactionController.getById);

router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRole("admin"),
  transactionController.updateStatus,
);

export default router;
