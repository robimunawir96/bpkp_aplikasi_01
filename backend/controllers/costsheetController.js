const xlsx = require('xlsx');
const Costsheet = require('../models/Costsheet');

const getCostsheet = async (req, res) => {
  const { year } = req.params;
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const costsheet = await Costsheet.findAll(
      year,
      search,
      parseInt(page),
      parseInt(limit)
    );
    res.json(costsheet);
  } catch (error) {
    console.error('Error in getCostsheet:', error); // Tambahkan log ini
    res
      .status(500)
      .json({ message: 'Error fetching costsheet', error: error.message });
  }
};

const getCostsheetById = async (req, res) => {
  const { year, id } = req.params;
  try {
    const costsheet = await Costsheet.findById(year, id);
    if (!costsheet)
      return res.status(404).json({ message: 'Costsheet not found' });
    res.json(costsheet);
  } catch (error) {
    console.error('Error in getCostsheetById:', error);
    res
      .status(500)
      .json({ message: 'Error fetching costsheet', error: error.message });
  }
};

const createCostsheet = async (req, res) => {
  const { year } = req.params;
  try {
    const newCostsheetId = await Costsheet.create(year, req.body);
    res.status(201).json({
      message: 'Costsheet created successfully',
      id: newCostsheetId.insertId,
    });
  } catch (error) {
    console.error('Error in createCostsheet:', error);
    res
      .status(500)
      .json({ message: 'Error creating costsheet', error: error.message });
  }
};

const updateCostsheet = async (req, res) => {
  const { year, id } = req.params;
  try {
    await Costsheet.update(year, id, req.body);
    res.json({ message: 'Costsheet updated successfully' });
  } catch (error) {
    console.error('Error in updateCostsheet:', error);
    res
      .status(500)
      .json({ message: 'Error updating costsheet', error: error.message });
  }
};

const deleteCostsheet = async (req, res) => {
  const { year, id } = req.params;
  try {
    await Costsheet.remove(year, id);
    res.json({ message: 'Costsheet deleted successfully' });
  } catch (error) {
    console.error('Error in deleteCostsheet:', error);
    res
      .status(500)
      .json({ message: 'Error deleting costsheet', error: error.message });
  }
};

const uploadExcel = async (req, res) => {
  const { year } = req.params;
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Baca data sebagai string untuk menghindari masalah parsing otomatis tanggal
    const jsonData = xlsx.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
      defval: '',
    });

    const costsheetData = jsonData
      .slice(1)
      .map((row) => {
        // Fungsi pembantu untuk memformat tanggal dengan aman
        const formatDateForMySQL = (dateString) => {
          if (!dateString || dateString.trim() === '') {
            return null;
          }
          const d = new Date(dateString);
          // Periksa apakah hasil parsing adalah tanggal yang valid
          if (isNaN(d.getTime())) {
            console.error(`Tanggal tidak valid: ${dateString}`);
            return null;
          }
          return d.toISOString().split('T')[0];
        };

        return {
          status: row[1] || null,
          id_cs: row[2] || null,
          no_st: row[3] || null,
          // Gunakan fungsi pembantu untuk memformat tanggal
          tgl_st: formatDateForMySQL(row[4]),
          tgl_pengajuan: formatDateForMySQL(row[5]),
          uraian: row[6] || null,
          beban: row[7] || null,
          mak: row[8] || null,
          biaya: parseInt(row[9].toString().replace(/\D/g, '')) || 0,
          created_updated_by: row[10] || null,
          bidang: row[11] || null,
        };
      })
      .filter((c) => c.id_cs); // Hanya tambahkan jika ID CS ada

    for (const c of costsheetData) {
      await Costsheet.create(year, c);
    }

    res
      .status(201)
      .json({
        message: `${costsheetData.length} costsheet uploaded successfully`,
      });
  } catch (error) {
    console.error('Error in uploadExcel:', error);
    res
      .status(500)
      .json({ message: 'Error uploading file', error: error.message });
  }
};

const downloadExcel = async (req, res) => {
  const { year } = req.params;
  try {
    const { data } = await Costsheet.findAll(year, '', 1, 10000);
    const worksheet = xlsx.utils.json_to_sheet(
      data.map((c) => ({
        STATUS: c.status,
        'ID CS': c.id_cs,
        'NO ST': c.no_st,
        'TGL ST': c.tgl_st,
        'TGL PENGAJUAN': c.tgl_pengajuan,
        URAIAN: c.uraian,
        BEBAN: c.beban,
        MAK: c.mak,
        BIAYA: c.biaya,
        'CREATED / UPDATED BY': c.created_updated_by,
        BIDANG: c.bidang,
      }))
    );
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Costsheet');
    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=costsheet_${year}.xlsx`
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.send(buffer);
  } catch (error) {
    console.error('Error in downloadExcel:', error);
    res
      .status(500)
      .json({ message: 'Error downloading file', error: error.message });
  }
};

module.exports = {
  getCostsheet,
  getCostsheetById,
  createCostsheet,
  updateCostsheet,
  deleteCostsheet,
  uploadExcel,
  downloadExcel,
};
