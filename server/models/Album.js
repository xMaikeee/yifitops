const mongoose = require('mongoose');

const AlbumSchema = new mongoose.Schema({
  name: String,
  release_date: Date,
  artist_id: mongoose.Schema.Types.ObjectId,
  album_cover: String
});

module.exports = mongoose.model('Album', AlbumSchema);
