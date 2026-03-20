const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  daily_return_pct: { type: Number, required: true },
  duration_days: { type: Number, required: true },
  total_roi: { type: Number, required: true },
  tier: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Package', packageSchema);