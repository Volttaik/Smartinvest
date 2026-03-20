require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./db');
const seedPackages = require('./seeds/packages');
const { startCronJobs } = require('./lib/cron');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/packages', require('./routes/packages'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/referrals', require('./routes/referrals'));

app.get('/api/health', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      res.json({
        status: 'ok',
        db: 'connected',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ status: 'error', db: 'disconnected' });
    }
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 SmartInvest API running on port ${PORT}`);
  try {
    await connectDB();
    await seedPackages();
    startCronJobs();
  } catch (err) {
    console.error('Startup error:', err);
  }
});