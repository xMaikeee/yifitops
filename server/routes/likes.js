const express = require('express');
const router = express.Router();
const Like = require('../models/Like');

// Get liked songs for a specific user
router.get('/:userId', async (req, res) => {
  const likes = await Like.find({ user_id: req.params.userId });
  res.json(likes);
});

// Like a song
router.post('/', async (req, res) => {
  const like = new Like(req.body);
  await like.save();
  res.status(201).json(like);
});

module.exports = router;
