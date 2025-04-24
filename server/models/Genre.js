const mongoose = require('mongoose');

const GenreSchema = new mongoose.Schema({
  name: String,
  song_id: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model('Genre', GenreSchema);
