import { Router } from 'express';
import * as promotionController from '../controllers/promotionController.js';

const router = Router();

router.get('/', promotionController.getAll);
router.get('/:id', promotionController.getById);
router.post('/', promotionController.create);
router.put('/:id', promotionController.update);
router.delete('/:id', promotionController.remove);
router.post('/:id/conditions', promotionController.addCondition);
router.delete('/:id/conditions/:conditionId', promotionController.deleteCondition);
router.post('/:id/rewards', promotionController.addReward);
router.delete('/:id/rewards/:rewardId', promotionController.deleteReward);

export default router;    