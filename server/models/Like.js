const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  song_id: mongoose.Schema.Types.ObjectId,
  savedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Like', LikeSchema);
