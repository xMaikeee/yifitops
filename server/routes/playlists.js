const express = require('express');
const Playlist = require('../models/Playlist');
const authP = require('../middleware/auth');
const routerP = express.Router();

// Protect all playlist routes
routerP.use(authP);

// Get playlists for a user
routerP.get('/:userId', async (req, res) => {
  const lists = await Playlist.find({ user_id: req.params.userId }).lean();
  res.json(lists);
});

// Create or add song to playlist
routerP.post('/', async (req, res) => {
  const { name, user_id, song_id, order } = req.body;
  let pl = await Playlist.findOne({ name, user_id });
  if (pl) {
    pl.songs.push({ song_id, order });
    await pl.save();
  } else {
    pl = await Playlist.create({ name, user_id, songs: [{ song_id, order }] });
  }
  res.status(201).json(pl);
});

// Remove a song from a playlist
routerP.delete('/:playlistId/songs/:songId', async (req, res) => {
  const { playlistId, songId } = req.params;
  await Playlist.updateOne(
    { _id: playlistId },
    { $pull: { songs: { song_id: songId } } }
  );
  res.json({ message: 'Song removed from playlist' });
});

// Delete entire playlist
routerP.delete('/:playlistId', async (req, res) => {
  await Playlist.deleteOne({ _id: req.params.playlistId });
  res.json({ message: 'Playlist deleted' });
});

module.exports = routerP;