const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
  name: String,
  user_id: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  songs: [
    {
      song_id: mongoose.Schema.Types.ObjectId,
      order: Number
    }
  ]
});

module.exports = mongoose.model('Playlist', PlaylistSchema);
