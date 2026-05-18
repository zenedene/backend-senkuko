import express from "express";
const router = express.Router();
import customerController from '../controllers/customerController.js';

router.get('/', customerController.getAll);
router.get('/by-status', customerController.getByStatus);
router.get('/:id', customerController.getById);
router.post('/', customerController.create);
router.put('/:id', customerController.update);
router.patch('/:id/status', customerController.updateStatus);
router.delete('/:id', customerController.remove);

export default router;