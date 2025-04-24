// /server/routes/songs.js
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const musicMetadata = require('music-metadata');
const Song = require('../models/Song');

console.log('🔔 [songs.js] router loaded');

// Ensure uploads folder exists under server/uploads
const UPLOAD_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Multer → save into server/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename:   (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

const router = express.Router();

// GET all songs
router.get('/', async (req, res) => {
  const songs = await Song.find().lean();
  res.json(songs);
});

// POST upload + real duration + file_path
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('>> Upload handler hit');
    console.log('req.file =', req.file);

    const diskPath = req.file.path;
    console.log('diskPath =', diskPath);

    const metadata = await musicMetadata.parseFile(diskPath);
    console.log('metadata.format.duration =', metadata.format.duration);

    const length = Math.round(metadata.format.duration || 0);
    const file_path = `/uploads/${req.file.filename}`;
    console.log('Calculated:', { length, file_path });

    const newSong = await Song.create({
      song_name:   req.body.song_name,
      length,
      release_date: new Date(),
      album_id:    null,
      artist_id:   null,
      file_path
    });

    console.log('Saved newSong =', newSong);
    return res.status(201).json(newSong);
  } catch (err) {
    console.error('❌ Upload error:', err);
    return res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

module.exports = router;
