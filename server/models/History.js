const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  user_id: mongoose.Schema.Types.ObjectId,
  song_id: mongoose.Schema.Types.ObjectId,
  playedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History', HistorySchema);
