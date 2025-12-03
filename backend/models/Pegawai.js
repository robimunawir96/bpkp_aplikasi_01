const dbPool = require('../config/db');

const findAll = async (search, page, limit) => {
  let query = 'SELECT * FROM pegawai';
  let countQuery = 'SELECT COUNT(*) as totalItems FROM pegawai';
  const args = [];

  // --- Tambahkan klausa WHERE jika ada pencarian ---
  if (search) {
    const searchPattern = `%${search}%`;
    query +=
      ' WHERE nama LIKE ? OR nip_baru LIKE ? OR nip_lama LIKE ? OR bidang LIKE ? OR jabatan LIKE ?';
    countQuery +=
      ' WHERE nama LIKE ? OR nip_baru LIKE ? OR nip_lama LIKE ? OR bidang LIKE ? OR jabatan LIKE ?';

    // Tambahkan argumen untuk pencarian
    for (let i = 0; i < 5; i++) {
      args.push(searchPattern);
    }
  }

  // --- Tambahkan Pagination (CARA BARU) ---
  const offset = (page - 1) * limit;
  // Pastikan limit dan offset adalah angka untuk mencegah SQL Injection
  const safeLimit = parseInt(limit, 10);
  const safeOffset = parseInt(offset, 10);

  // Masukkan langsung ke string query, bukan sebagai placeholder
  query += ` ORDER BY id DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

  try {
    // Eksekusi query untuk mendapatkan data (args hanya untuk WHERE clause)
    const [data] = await dbPool.execute(query, args);

    // Eksekusi query untuk mendapatkan total item
    const [countResult] = await dbPool.execute(countQuery, args);

    return {
      data,
      totalItems: countResult[0].totalItems,
      totalPages: Math.ceil(countResult[0].totalItems / safeLimit),
    };
  } catch (error) {
    console.error('Error in Pegawai.findAll:', error);
    throw error;
  }
};

const findById = async (id) => {
  const [rows] = await dbPool.execute('SELECT * FROM pegawai WHERE id = ?', [
    id,
  ]);
  return rows[0];
};

const create = async (pegawaiData) => {
  const { nip_baru, nip_lama, nama, bidang, jabatan } = pegawaiData;
  const [result] = await dbPool.execute(
    'INSERT INTO pegawai (nip_baru, nip_lama, nama, bidang, jabatan) VALUES (?, ?, ?, ?, ?)',
    [nip_baru, nip_lama, nama, bidang, jabatan]
  );
  return result;
};

const update = async (id, pegawaiData) => {
  const { nip_baru, nip_lama, nama, bidang, jabatan } = pegawaiData;
  const [result] = await dbPool.execute(
    'UPDATE pegawai SET nip_baru = ?, nip_lama = ?, nama = ?, bidang = ?, jabatan = ? WHERE id = ?',
    [nip_baru, nip_lama, nama, bidang, jabatan, id]
  );
  return result;
};

const remove = async (id) => {
  const [result] = await dbPool.execute('DELETE FROM pegawai WHERE id = ?', [
    id,
  ]);
  return result;
};

module.exports = { findAll, findById, create, update, remove };
