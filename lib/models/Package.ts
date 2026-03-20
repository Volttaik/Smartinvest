import { Schema, model, models } from 'mongoose';

const packageSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  daily_return_pct: { type: Number, required: true },
  duration_days: { type: Number, required: true },
  total_roi: { type: Number, required: true },
  tier: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
});

export const Package = models.Package || model('Package', packageSchema);
