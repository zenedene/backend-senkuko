import { Router } from 'express';
import * as voucherController from '../controllers/voucherController.js';

const router = Router();

router.get('/', voucherController.getAll);
router.get('/:id', voucherController.getById);
router.post('/', voucherController.create);
router.put('/:id', voucherController.update);
router.delete('/:id', voucherController.remove);

export default router;