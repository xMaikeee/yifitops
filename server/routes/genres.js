const express = require('express');
const router = express.Router();
const Genre = require('../models/Genre');

// Get all genres
router.get('/', async (req, res) => {
  const genres = await Genre.find();
  res.json(genres);
});

// Add a new genre
router.post('/', async (req, res) => {
  const genre = new Genre(req.body);
  await genre.save();
  res.status(201).json(genre);
});

module.exports = router;
