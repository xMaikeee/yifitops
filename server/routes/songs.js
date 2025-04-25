const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const musicMetadata = require('music-metadata');
const Song = require('../models/Song');
const auth = require('../middleware/auth');

const router = express.Router();

// Ensure uploads folder exists
const UPLOAD_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename:   (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Protect all song routes
router.use(auth);

// GET all songs
router.get('/', async (req, res) => {
  try {
    const songs = await Song.find().lean();
    res.json(songs);
  } catch (err) {
    console.error('Error fetching songs:', err);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

// POST upload + metadata (audio + optional cover)
router.post(
  '/upload',
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log('Received files:', req.files);
      const audioFile = req.files.file[0];
      const coverFile = req.files.cover?.[0];

      // Extract duration metadata
      const metadata = await musicMetadata.parseFile(audioFile.path);
      const length = Math.round(metadata.format.duration || 0);

      const file_path  = `/uploads/${audioFile.filename}`;
      const image_path = coverFile ? `/uploads/${coverFile.filename}` : null;

      const newSong = await Song.create({
        song_name:    req.body.song_name,
        length,
        release_date: new Date(),
        album_id:     null,
        artist_id:    req.user.id,
        file_path,
        image_path
      });

      res.status(201).json(newSong);
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Upload failed', details: err.message });
    }
  }
);

// DELETE a song by ID (remove audio + cover)
router.delete('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ error: 'Song not found' });
    if (song.artist_id.toString() !== req.user.id)
      return res.status(403).json({ error: 'Forbidden' });

    // Remove audio file
    const audioFull = path.join(UPLOAD_DIR, path.basename(song.file_path));
    if (fs.existsSync(audioFull)) fs.unlinkSync(audioFull);

    // Remove cover image if present
    if (song.image_path) {
      const coverFull = path.join(UPLOAD_DIR, path.basename(song.image_path));
      if (fs.existsSync(coverFull)) fs.unlinkSync(coverFull);
    }

    await song.deleteOne();
    res.json({ message: 'Song and cover deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Deletion failed' });
  }
});

module.exports = router;