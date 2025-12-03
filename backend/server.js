require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const pegawaiRoutes = require('./routes/pegawaiRoutes');
const costsheetRoutes = require('./routes/costsheetRoutes');
const bnbaRoutes = require('./routes/bnbaRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors()); // Izinkan request dari origin lain (frontend)
app.use(express.json()); // Parsing body JSON

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pegawai', pegawaiRoutes);
app.use('/api/costsheet', costsheetRoutes);
app.use('/api/bnba', bnbaRoutes);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
