const Bnba = require('../models/Bnba');

const getBnba = async (req, res) => {
  const { year } = req.params;
  try {
    const { page = 1, limit = 10 } = req.query;
    const bnba = await Bnba.findAll(year, parseInt(page), parseInt(limit));
    res.json(bnba);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching BNBA data', error });
  }
};

const updateBnba = async (req, res) => {
  const { year, id } = req.params;
  const { nominal_bnba } = req.body;
  try {
    await Bnba.update(year, id, parseInt(nominal_bnba));
    res.json({ message: 'Nominal BNBA updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating BNBA', error });
  }
};

const getBnbaAll = async (req, res) => {
  const { year } = req.params;
  try {
    // Panggil findAll dengan page dan limit yang sangat besar untuk mendapatkan semua data
    const bnba = await Bnba.findAll(year, 1, 1000);
    res.json(bnba.data); // Hanya kembalikan array data-nya
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching all BNBA data for chart', error });
  }
};
module.exports = { getBnba, updateBnba, getBnbaAll };
