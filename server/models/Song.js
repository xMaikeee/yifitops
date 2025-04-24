const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
  song_name: String,
  length: Number,
  release_date: Date,
  album_id: mongoose.Schema.Types.ObjectId,
  artist_id: mongoose.Schema.Types.ObjectId,
  file_path: String // New field to store the file path
});

module.exports = mongoose.model('Song', SongSchema);
