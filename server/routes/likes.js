const express = require('express');
const Like = require('../models/Like');
const auth = require('../middleware/auth');
const router = express.Router();

// Protect all like routes
router.use(auth);

// Get favorites for a user
router.get('/:userId', async (req, res) => {
  const likes = await Like.find({ user_id: req.params.userId });
  res.json(likes);
});

// Add favorite
router.post('/', async (req, res) => {
  const like = await Like.create(req.body);
  res.status(201).json(like);
});

// Remove favorite by user and song
router.delete('/:userId/:songId', async (req, res) => {
  await Like.deleteOne({ user_id: req.params.userId, song_id: req.params.songId });
  res.json({ message: 'Favorite removed' });
});

module.exports = router;