const express = require('express');
const router = express.Router();
const bnbaController = require('../controllers/bnbaController');

router.get('/:year', bnbaController.getBnba);
router.put('/:year/:id', bnbaController.updateBnba);
router.get('/:year/all', bnbaController.getBnbaAll);

module.exports = router;
