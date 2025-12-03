const dbPool = require('../config/db');

// Fungsi untuk mendapatkan nama tabel secara dinamis
const getTableName = (year) => `costsheet_${year}`;

const findAll = async (year, search, page, limit) => {
  const tableName = getTableName(year);
  let query = `SELECT * FROM ${tableName}`;
  let countQuery = `SELECT COUNT(*) as totalItems FROM ${tableName}`;
  const params = [];

  if (search) {
    const searchPattern = `%${search}%`;
    query +=
      ' WHERE id_cs LIKE ? OR no_st LIKE ? OR mak LIKE ? OR created_updated_by LIKE ?';
    countQuery +=
      ' WHERE id_cs LIKE ? OR no_st LIKE ? OR mak LIKE ? OR created_updated_by LIKE ?';
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  // --- PERUBAHAN KRUSIAL: SOLUSI TERAKHIR ---
  // Karena bug di mysql2 pool dengan placeholder LIMIT, kita akan
  // memasukkan angka langsung ke string query setelah validasi.
  // Ini aman karena kita sudah memastikan 'page' dan 'limit' adalah angka.
  const currentPage = Number(page) > 0 ? Number(page) : 1;
  const currentPageLimit = Number(limit) > 0 ? Number(limit) : 10;
  const offset = (currentPage - 1) * currentPageLimit;

  query += ` ORDER BY id DESC LIMIT ${offset}, ${currentPageLimit}`;

  // Eksekusi query utama. Parameter array hanya untuk klausa WHERE.
  const [data] = await dbPool.execute(query, params);

  // Eksekusi query count
  const countParams = search ? params : [];
  const [countResult] = await dbPool.execute(countQuery, countParams);

  return {
    data,
    totalItems: countResult[0].totalItems,
    totalPages: Math.ceil(countResult[0].totalItems / currentPageLimit),
  };
};

// ... (fungsi findById, create, update, remove tidak perlu diubah, biarkan seperti sebelumnya)
const findById = async (year, id) => {
  const tableName = getTableName(year);
  const [rows] = await dbPool.execute(
    `SELECT * FROM ${tableName} WHERE id = ?`,
    [id]
  );
  return rows[0];
};

const create = async (year, costsheetData) => {
  const tableName = getTableName(year);
  const {
    status,
    id_cs,
    no_st,
    tgl_st,
    tgl_pengajuan,
    uraian,
    beban,
    mak,
    biaya,
    created_updated_by,
    bidang,
  } = costsheetData;

  // Gunakan INSERT ... ON DUPLICATE KEY UPDATE
  // Jika id_cs sudah ada, maka baris tersebut akan diupdate.
  // Jika id_cs belum ada, maka baris baru akan ditambahkan.
  const [result] = await dbPool.execute(
    `INSERT INTO ${tableName} (status, id_cs, no_st, tgl_st, tgl_pengajuan, uraian, beban, mak, biaya, created_updated_by, bidang) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
         status = VALUES(status), 
         no_st = VALUES(no_st), 
         tgl_st = VALUES(tgl_st), 
         tgl_pengajuan = VALUES(tgl_pengajuan), 
         uraian = VALUES(uraian), 
         beban = VALUES(beban), 
         mak = VALUES(mak), 
         biaya = VALUES(biaya), 
         created_updated_by = VALUES(created_updated_by), 
         bidang = VALUES(bidang)`,
    [
      status,
      id_cs,
      no_st,
      tgl_st,
      tgl_pengajuan,
      uraian,
      beban,
      mak,
      biaya,
      created_updated_by,
      bidang,
    ]
  );
  return result;
};

const update = async (year, id, costsheetData) => {
  const tableName = getTableName(year);
  const {
    status,
    id_cs,
    no_st,
    tgl_st,
    tgl_pengajuan,
    uraian,
    beban,
    mak,
    biaya,
    created_updated_by,
    bidang,
  } = costsheetData;
  const [result] = await dbPool.execute(
    `UPDATE ${tableName} SET status = ?, id_cs = ?, no_st = ?, tgl_st = ?, tgl_pengajuan = ?, uraian = ?, beban = ?, mak = ?, biaya = ?, created_updated_by = ?, bidang = ? WHERE id = ?`,
    [
      status,
      id_cs,
      no_st,
      tgl_st,
      tgl_pengajuan,
      uraian,
      beban,
      mak,
      biaya,
      created_updated_by,
      bidang,
      id,
    ]
  );
  return result;
};

const remove = async (year, id) => {
  const tableName = getTableName(year);
  const [result] = await dbPool.execute(
    `DELETE FROM ${tableName} WHERE id = ?`,
    [id]
  );
  return result;
};

module.exports = { findAll, findById, create, update, remove };
