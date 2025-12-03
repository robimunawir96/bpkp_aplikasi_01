const express = require('express');
const multer = require('multer');
const router = express.Router();
const costsheetController = require('../controllers/costsheetController');

const upload = multer({ dest: 'uploads/' });

router.get('/:year', costsheetController.getCostsheet);
router.post('/:year', costsheetController.createCostsheet);
router.put('/:year/:id', costsheetController.updateCostsheet);
router.delete('/:year/:id', costsheetController.deleteCostsheet);
router.post(
  '/:year/upload',
  upload.single('file'),
  costsheetController.uploadExcel
);
router.get('/:year/download', costsheetController.downloadExcel);

module.exports = router;
