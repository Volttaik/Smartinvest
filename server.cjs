const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./lib/db.cjs');

// Import route handlers
const authRoutes = require('./api/auth/index.cjs');
const dashboardRoutes = require('./api/dashboard/index.cjs');
const walletRoutes = require('./api/wallet/index.cjs');
const investmentRoutes = require('./api/investments/index.cjs');
const packageRoutes = require('./api/packages/index.cjs');
const referralRoutes = require('./api/referrals/index.cjs');
const initRoutes = require('./api/init/index.cjs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/init', initRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SmartInvest API is running' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await connectDB();
    console.log('✓ Database connected');

    app.listen(PORT, () => {
      console.log(`✓ SmartInvest server running on port ${PORT}`);
      console.log(`  API: http://localhost:${PORT}/api`);
      console.log(`  Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;