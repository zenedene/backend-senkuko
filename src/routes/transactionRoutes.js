import { query, validationResult } from "express-validator";
import authMiddleware, { authorizeRole } from "../auth/authMiddleware.js";
import transactionController from "../controllers/transactionController.js";
import express from "express";


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

// New summary endpoint (customer or admin) - MUST be before /:id
router.get(
  "/summary",
  authMiddleware,
  query("start").isISO8601().notEmpty(),
  query("end").isISO8601().notEmpty(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Invalid query", errors: errors.array() });
    }
    transactionController.getSummary(req, res);
  },
);

// New export endpoint with pagination - MUST be before /:id
router.get(
  "/export",
  authMiddleware,
  query("start").isISO8601().notEmpty(),
  query("end").isISO8601().notEmpty(),
  query("offset").optional().isInt({ min: 0 }),
  query("limit").optional().isInt({ min: 1 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Invalid query", errors: errors.array() });
    }
    transactionController.exportTx(req, res);
  },
);

router.get(
  "/:id/check-payment",
  authMiddleware,
  transactionController.checkPayment
);

router.get("/:id", authMiddleware, transactionController.getById);

router.patch(
  "/:id/cancel",
  authMiddleware,
  authorizeRole("customer"),
  transactionController.cancelTransaction,
);

router.patch(
  "/:id/admin-cancel",
  authMiddleware,
  authorizeRole("admin"),
  transactionController.adminCancelTransaction,
);

router.patch(
  "/:id/payment-status",
  authMiddleware,
  authorizeRole("admin"),
  transactionController.updatePaymentStatus,
);

// ✅ ADMIN UPDATE TRANSACTION STATUS
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRole("admin"),
  transactionController.updateStatus,
);

export default router;
