import mongoose, { Schema, model, models } from 'mongoose';

const notificationSchema = new Schema({
  user_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:       { type: String, enum: ['login', 'deposit', 'withdrawal', 'investment', 'referral', 'system', 'info'], default: 'system' },
  title:      { type: String, required: true },
  message:    { type: String, required: true },
  read:       { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

notificationSchema.index({ user_id: 1, created_at: -1 });

export const Notification = models.Notification || model('Notification', notificationSchema);
