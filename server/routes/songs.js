const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const multer = require('multer');
const path = require('path');
const musicMetadata = require('music-metadata'); // Import the library

// Set up Multer to handle file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Handle song upload and extract metadata
router.post('/upload', upload.single('file'), async (req, res) => {
  const { song_name } = req.body;
  const file_path = `/uploads/${req.file.filename}`;

  // Use music-metadata to get the file's duration
  const metadata = await musicMetadata.parseFile(path.join(__dirname, '..', file_path));

  // Get the duration from the metadata (in seconds)
  const length = Math.round(metadata.format.duration); // Round it to the nearest second

  // Create a new Song document in the database
  const newSong = new Song({
    song_name,
    length, // Use the real length
    release_date: new Date(),
    album_id: null,
    artist_id: null,
    file_path
  });

  await newSong.save();
  res.status(201).json(newSong);
});

module.exports = router;
