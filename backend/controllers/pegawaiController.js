const xlsx = require('xlsx');
const dbPool = require('../config/db');
const Pegawai = require('../models/Pegawai');

const getPegawai = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;

    // Pastikan page dan limit adalah angka
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const pegawai = await Pegawai.findAll(search, pageNum, limitNum);
    res.json(pegawai);
  } catch (error) {
    // Tampilkan error di console backend
    console.error('Error in getPegawai controller:', error);
    res
      .status(500)
      .json({ message: 'Error fetching pegawai', error: error.message });
  }
};

const getPegawaiById = async (req, res) => {
  try {
    const pegawai = await Pegawai.findById(req.params.id);
    if (!pegawai) return res.status(404).json({ message: 'Pegawai not found' });
    res.json(pegawai);
  } catch (error) {
    console.error('Error in getPegawaiById controller:', error);
    res
      .status(500)
      .json({ message: 'Error fetching pegawai', error: error.message });
  }
};

const createPegawai = async (req, res) => {
  try {
    const newPegawaiId = await Pegawai.create(req.body);
    res.status(201).json({
      message: 'Pegawai created successfully',
      id: newPegawaiId.insertId,
    });
  } catch (error) {
    console.error('Error in createPegawai controller:', error);
    res
      .status(500)
      .json({ message: 'Error creating pegawai', error: error.message });
  }
};

const updatePegawai = async (req, res) => {
  try {
    await Pegawai.update(req.params.id, req.body);
    res.json({ message: 'Pegawai updated successfully' });
  } catch (error) {
    console.error('Error in updatePegawai controller:', error);
    res
      .status(500)
      .json({ message: 'Error updating pegawai', error: error.message });
  }
};

const deletePegawai = async (req, res) => {
  try {
    await Pegawai.remove(req.params.id);
    res.json({ message: 'Pegawai deleted successfully' });
  } catch (error) {
    console.error('Error in deletePegawai controller:', error);
    res
      .status(500)
      .json({ message: 'Error deleting pegawai', error: error.message });
  }
};

const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    const pegawaiData = jsonData
      .slice(1)
      .map((row) => ({
        nip_baru: row[1] || null,
        nip_lama: row[2] || null,
        nama: row[3] || null,
        bidang: row[4] || null,
        jabatan: row[5] || null,
      }))
      .filter((p) => p.nama); // Hanya tambahkan jika nama ada

    // Bulk insert (looping sederhana, bisa dioptimalkan)
    for (const p of pegawaiData) {
      await Pegawai.create(p);
    }

    res
      .status(201)
      .json({ message: `${pegawaiData.length} pegawai uploaded successfully` });
  } catch (error) {
    console.error('Error in uploadExcel controller:', error);
    res
      .status(500)
      .json({ message: 'Error uploading file', error: error.message });
  }
};

const downloadExcel = async (req, res) => {
  try {
    const { data } = await Pegawai.findAll('', 1, 10000); // Ambil semua data
    const worksheet = xlsx.utils.json_to_sheet(
      data.map((p) => ({
        'NIP Baru': p.nip_baru,
        'NIP Lama': p.nip_lama,
        Nama: p.nama,
        Bidang: p.bidang,
        Jabatan: p.jabatan,
      }))
    );
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Pegawai');
    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Disposition', 'attachment; filename=pegawai.xlsx');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.send(buffer);
  } catch (error) {
    console.error('Error in downloadExcel controller:', error);
    res
      .status(500)
      .json({ message: 'Error downloading file', error: error.message });
  }
};

const getTotalPegawaiPerBidang = async (req, res) => {
  try {
    const [rows] = await dbPool.execute(
      'SELECT bidang, COUNT(*) as total_pegawai FROM pegawai GROUP BY bidang'
    );
    res.json(rows);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching total pegawai per bidang', error });
  }
};

module.exports = {
  getPegawai,
  getPegawaiById,
  createPegawai,
  updatePegawai,
  deletePegawai,
  uploadExcel,
  downloadExcel,
  getTotalPegawaiPerBidang,
};
