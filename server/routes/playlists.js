const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');

// Get playlists for a specific user
router.get('/:userId', async (req, res) => {
  const playlists = await Playlist.find({ user_id: req.params.userId });
  res.json(playlists);
});

// Create a new playlist
router.post('/', async (req, res) => {
  const playlist = new Playlist(req.body);
  await playlist.save();
  res.status(201).json(playlist);
});

module.exports = router;
