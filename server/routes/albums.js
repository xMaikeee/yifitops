const express = require('express');
const router = express.Router();
const Album = require('../models/Album');

// Get all albums
router.get('/', async (req, res) => {
  const albums = await Album.find();
  res.json(albums);
});

// Create a new album
router.post('/', async (req, res) => {
  const album = new Album(req.body);
  await album.save();
  res.status(201).json(album);
});

module.exports = router;
