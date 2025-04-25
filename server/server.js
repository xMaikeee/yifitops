const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Routes
const authRoutes = require('./routes/auth');
const songRoutes = require('./routes/songs');
const playlistRoutes = require('./routes/playlists');
const albumRoutes = require('./routes/albums');
const genreRoutes = require('./routes/genres');
const likeRoutes = require('./routes/likes');
const historyRoutes = require('./routes/history');

const app = express();

app.use(cors());
app.use(express.json());
// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/yifitops');
    console.log('MongoDB connected');

    // Authentication
    app.use('/auth', authRoutes);

    // Protected routes (you can add middleware here to protect)
    app.use('/songs', songRoutes);
    app.use('/playlists', playlistRoutes);
    app.use('/albums', albumRoutes);
    app.use('/genres', genreRoutes);
    app.use('/likes', likeRoutes);
    app.use('/history', historyRoutes);

    app.listen(3000, () => console.log('Server started on http://localhost:3000'));
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
})();
