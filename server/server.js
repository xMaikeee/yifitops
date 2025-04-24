// /server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// 🎯 Log every incoming request
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

// Serve static uploads from server/uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// —— Connect to MongoDB, then mount routes & start server ——  
(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/yifitops');
    console.log('✅ MongoDB connected');

    console.log('🚀 Mounting routes');
    app.use('/songs', require('./routes/songs'));
    app.use('/users', require('./routes/users'));
    app.use('/playlists', require('./routes/playlists'));
    app.use('/albums', require('./routes/albums'));
    app.use('/genres', require('./routes/genres'));
    app.use('/likes', require('./routes/likes'));
    app.use('/history', require('./routes/history'));

    app.listen(3000, () => console.log('Server started on http://localhost:3000'));
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
})();
