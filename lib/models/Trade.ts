import mongoose, { Schema, model, models } from 'mongoose';

const tradeSchema = new Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  investment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Investment' },
  type: { type: String, enum: ['gain', 'loss'], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  created_at: { type: Date, default: Date.now },
});

export const Trade = models.Trade || model('Trade', tradeSchema);
