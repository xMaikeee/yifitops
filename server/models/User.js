const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  birth_date: Date,
  role: { type: String, enum: ['listener', 'artist'] },
  createdDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
