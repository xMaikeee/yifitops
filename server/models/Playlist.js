const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
  name: String,
  user_id: mongoose.Schema.Types.ObjectId,
  songs: [
    {
      song_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
      order: Number
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Playlist', PlaylistSchema);