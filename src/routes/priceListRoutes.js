const express = require('express');
const router = express.Router();
const priceListController = require('../controllers/priceListController');

router.get('/', priceListController.getAll);
router.get('/:id', priceListController.getById);
router.post('/', priceListController.create);
router.put('/:id', priceListController.update);
router.delete('/:id', priceListController.remove);

module.exports = router;