import express from "express";
const router = express.Router();
import transactionController from '../controllers/transactionController.js';
router.get('/', transactionController.getAll);
router.get('/:id', transactionController.getById);
router.post('/', transactionController.create);

export default router