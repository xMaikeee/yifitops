const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// Routes
const songRoutes = require('./routes/songs');
const userRoutes = require('./routes/users');
const playlistRoutes = require('./routes/playlists');
const albumRoutes = require('./routes/albums');
const genreRoutes = require('./routes/genres');
const likeRoutes = require('./routes/likes');
const historyRoutes = require('./routes/history');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (uploads)
app.use('/uploads', express.static('uploads'));

mongoose.connect('mongodb://localhost:27017/yifitops', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use('/songs', songRoutes);
app.use('/users', userRoutes);
app.use('/playlists', playlistRoutes);
app.use('/albums', albumRoutes);
app.use('/genres', genreRoutes);
app.use('/likes', likeRoutes);
app.use('/history', historyRoutes);


app.listen(3000, () => console.log('Server started on http://localhost:3000'));
