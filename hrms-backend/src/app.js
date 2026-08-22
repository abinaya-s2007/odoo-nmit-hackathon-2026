const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const profileRoutes = require('./routes/profileRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const timeoffRoutes = require('./routes/timeoffRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// IMPORTANT: Express enables ETag caching by default, which makes GET
// requests return "304 Not Modified" with no body on repeat calls.
// axios treats any non-2xx status (304 included) as an error, so every
// re-fetch of the same endpoint (dashboard, employees, attendance...)
// would fail on the frontend even though the backend is fine. Since
// these are live JSON API responses (not static assets), disable it.
app.set('etag', false);

app.use(cors()); // hackathon-friendly: allow any origin
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use(express.json());
app.use(morgan('dev'));

// Serve uploaded avatars/logos statically.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'dayflow-hrms-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timeoff', timeoffRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
});

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ message: 'A record with that value already exists.' });
  }
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ message: err.errors?.[0]?.message || 'Validation error.' });
  }
  if (err instanceof multerFileSizeError()) {
    return res.status(413).json({ message: 'File too large.' });
  }

  return res.status(err.status || 500).json({ message: err.message || 'Something went wrong.' });
});

function multerFileSizeError() {
  try {
    // Lazily require to avoid a hard dependency at module load time.
    // eslint-disable-next-line global-require
    return require('multer').MulterError;
  } catch (e) {
    return class NeverMatches {};
  }
}

module.exports = app;