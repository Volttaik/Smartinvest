const mongoose = require('mongoose');

const captchaCodeSchema = new mongoose.Schema({
  session_key: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  expires_at: { type: Date, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CaptchaCode', captchaCodeSchema);