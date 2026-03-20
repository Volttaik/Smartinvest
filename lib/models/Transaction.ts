import { Schema, model, models } from 'mongoose';

const transactionSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true, enum: ['deposit', 'withdrawal', 'investment', 'daily_return', 'referral_bonus', 'trade_gain', 'trade_loss'] },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  paystack_ref: { type: String },
  reference: { type: String },
  metadata: { type: Schema.Types.Mixed },
  created_at: { type: Date, default: Date.now },
});

export const Transaction = models.Transaction || model('Transaction', transactionSchema);
