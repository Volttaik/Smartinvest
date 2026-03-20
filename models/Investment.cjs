const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  package_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  package_name: { type: String, required: true },
  amount: { type: Number, required: true },
  daily_return_pct: { type: Number, required: true },
  duration_days: { type: Number, required: true },
  total_earned: { type: Number, default: 0 },
  days_completed: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  start_date: { type: Date, default: Date.now },
  end_date: { type: Date },
  created_at: { type: Date, default: Date.now },
  last_return_at: { type: Date }
});

module.exports = mongoose.model('Investment', investmentSchema);