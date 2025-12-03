const dbPool = require('../config/db');

const getTableName = (year) => `bnba_${year}`;
const getCostsheetTableName = (year) => `costsheet_${year}`;

const findAll = async (year, page, limit) => {
  const bnbaTable = getTableName(year);
  const costsheetTable = getCostsheetTableName(year);

  // Query untuk mengambil SEMUA data tanpa pagination
  const query = `
        SELECT
            b.id,
            b.bidang,
            b.nominal_bnba,
            COALESCE(c_realisasi.total_realisasi, 0) AS realisasi,
            COALESCE(c_rencana.total_rencana, 0) AS rencana
        FROM
            ${bnbaTable} b
        LEFT JOIN
            (SELECT bidang, SUM(biaya) AS total_realisasi FROM ${costsheetTable} WHERE status != 0.5 GROUP BY bidang) c_realisasi ON TRIM(b.bidang) = TRIM(c_realisasi.bidang)
        LEFT JOIN
            (SELECT bidang, SUM(biaya) AS total_rencana FROM ${costsheetTable} WHERE status = 0.5 GROUP BY bidang) c_rencana ON TRIM(b.bidang) = TRIM(c_rencana.bidang)
        ORDER BY
            b.bidang ASC
    `;

  // Query untuk menghitung total item
  const countQuery = `SELECT COUNT(*) as totalItems FROM ${bnbaTable}`;

  try {
    // 1. Jalankan query untuk mendapatkan total data
    const [countResult] = await dbPool.execute(countQuery);
    const totalItems = countResult[0].totalItems;

    // 2. Jalankan query utama untuk mendapatkan semua baris data
    const [allData] = await dbPool.execute(query);

    // 3. Lakukan perhitungan untuk setiap baris DENGAN KONVERSI TIPE DATA
    const processedData = allData.map((item) => {
      const nominal = Number(item.nominal_bnba) || 0;
      const realisasi = Number(item.realisasi) || 0;
      const rencana = Number(item.rencana) || 0;

      const jumlah = realisasi + rencana;
      const persentase = nominal > 0 ? (jumlah / nominal) * 100 : 0;
      const saldo = nominal - jumlah;

      return {
        ...item,
        realisasi,
        rencana,
        jumlah,
        persentase,
        saldo,
      };
    });

    // 4. Lakukan pagination secara manual di JavaScript
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedData = processedData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      totalItems: totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  } catch (error) {
    console.error('!!! [BNBA Model] DATABASE ERROR !!!');
    console.error(error);
    throw error;
  }
};
const update = async (year, id, nominal_bnba) => {
  const tableName = getTableName(year);
  const [result] = await dbPool.execute(
    `UPDATE ${tableName} SET nominal_bnba = ? WHERE id = ?`,
    [nominal_bnba, id]
  );
  return result;
};

module.exports = { findAll, update };
