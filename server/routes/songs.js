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
  const songs = await Song.find().lean();
  res.json(songs);
});

// POST upload + metadata
router.post('/upload',
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const audioFile = req.files.file[0];
      const coverFile = req.files.cover?.[0]; 

      // extract metadata as before
      const diskPath = audioFile.path;
      const metadata = await musicMetadata.parseFile(diskPath);
      const length = Math.round(metadata.format.duration || 0);

      const file_path = `/uploads/${audioFile.filename}`;
      const image_path = coverFile ? `/uploads/${coverFile.filename}` : null;

      const newSong = await Song.create({
        song_name: req.body.song_name,
        length,
        release_date: new Date(),
        album_id: null,
        artist_id: req.user.id,
        file_path,
        image_path                        // <-- store it
      });

      res.status(201).json(newSong);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Upload failed', details: err.message });
    }
  }
);

// DELETE a song by ID (and remove file)
router.delete('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ error: 'Song not found' });
    if (song.artist_id.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    // remove file from disk
    const fullPath = path.join(__dirname, '../uploads', path.basename(song.file_path));
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    await song.deleteOne();
    res.json({ message: 'Song deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Deletion failed' });
  }
});

module.exports = router;
