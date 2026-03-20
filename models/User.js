const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  profile_picture: { type: String, default: 'avatar1' },
  balance: { type: Number, default: 0 },
  referral_code: { type: String, required: true, unique: true },
  referred_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  referral_earnings: { type: Number, default: 0 },
  total_earnings: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);