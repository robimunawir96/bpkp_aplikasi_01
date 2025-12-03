const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const pegawaiController = require('../controllers/pegawaiController');

// Konfigurasi Multer untuk upload file
const upload = multer({ dest: 'uploads/' });

// --- ROUTE DENGAN PATH SPESIFIK (HARUS DI ATAS) ---
router.get('/', pegawaiController.getPegawai);
router.get('/total-per-bidang', pegawaiController.getTotalPegawaiPerBidang); // PINDAHKAN INI KE ATAS
router.get('/download/all', pegawaiController.downloadExcel); // Juga lebih aman jika dipindahkan ke atas
// --- SELESAI ROUTE SPESIFIK ---

// --- ROUTE DENGAN PARAMETER (HARUS DI BAWAH) ---
router.get('/:id', pegawaiController.getPegawaiById); // TETAP DI BAWAH
router.put('/:id', pegawaiController.updatePegawai);
router.delete('/:id', pegawaiController.deletePegawai);
// --- SELESAI ROUTE PARAMETER ---

// Route POST bisa di mana saja, tapi biasanya dikelompokkan
router.post('/', pegawaiController.createPegawai);
router.post('/upload', upload.single('file'), pegawaiController.uploadExcel);

module.exports = router;
