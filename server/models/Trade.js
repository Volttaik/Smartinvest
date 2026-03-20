const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  asset: { type: String, required: true },
  type: { type: String, required: true, enum: ['buy', 'sell'] },
  amount: { type: Number, required: true },
  price: { type: Number, required: true },
  profit_loss: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trade', tradeSchema);