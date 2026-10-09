const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const requestRoutes = require('./routes/requestRoutes');
const proxyRoutes = require('./routes/proxyRoutes');
const environmentRoutes = require('./routes/environmentRoutes');
const historyRoutes = require('./routes/historyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mockRoutes = require('./routes/mockRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'API Testing Tool Engine',
    database: 'MongoDB',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/proxy', proxyRoutes);
app.use('/api/environments', environmentRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mock', mockRoutes);
app.use('/api/ai', aiRoutes);

// Serve static frontend build if present
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientBuildPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <html>
          <body style="font-family: sans-serif; background: #0d1117; color: #fff; padding: 40px; text-align: center;">
            <h2>API Testing Tool Backend is Running on port ${PORT}</h2>
            <p>Database: Connected to MongoDB</p>
            <p>To run the frontend in development mode, run: <code>cd client && npm run dev</code></p>
          </body>
        </html>
      `);
    }
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err,
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 API Testing Tool Server running on http://127.0.0.1:${PORT}`);
  console.log(`📊 Health Endpoint: http://localhost:${PORT}/api/health`);
  console.log(`🛠️ Mock APIs: http://localhost:${PORT}/api/mock/users`);
  console.log(`=======================================================`);
});
