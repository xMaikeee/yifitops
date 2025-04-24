const mongoose = require('mongoose');
const User = require('./models/User');
const Song = require('./models/Song');
const Playlist = require('./models/Playlist');
const Like = require('./models/Like');
const History = require('./models/History');
const Album = require('./models/Album');
const Genre = require('./models/Genre');

mongoose.connect('mongodb://localhost:27017/yifitops', { useNewUrlParser: true, useUnifiedTopology: true });

async function seed() {
  // Clear existing data
  await User.deleteMany();
  await Song.deleteMany();
  await Playlist.deleteMany();
  await Like.deleteMany();
  await History.deleteMany();
  await Album.deleteMany();
  await Genre.deleteMany();

  // Create a user
  const user = await User.create({
    name: 'Demo Listener',
    email: 'demo@example.com',
    password: 'password123',
    birth_date: new Date('1995-04-01'),
    role: 'listener'
  });

  // Create some songs
  const song1 = await Song.create({
    song_name: 'Echoes of Light',
    length: 240,
    release_date: new Date('2024-01-01'),
    album_id: null,
    artist_id: null
  });

  const song2 = await Song.create({
    song_name: 'Lunar Vibes',
    length: 180,
    release_date: new Date('2023-08-12'),
    album_id: null,
    artist_id: null
  });

  // Create a playlist with these songs
  const playlist = await Playlist.create({
    name: 'Chill Mix',
    user_id: user._id,
    songs: [
      { song_id: song1._id, order: 1 },
      { song_id: song2._id, order: 2 }
    ]
  });

  // Create an album
  const album = await Album.create({
    name: 'Chill Out Vibes',
    release_date: new Date('2024-06-01'),
    artist_id: user._id,
    album_cover: 'album-cover-url.jpg'
  });

  // Add songs to album
  await Song.updateOne({ _id: song1._id }, { $set: { album_id: album._id } });
  await Song.updateOne({ _id: song2._id }, { $set: { album_id: album._id } });

  // Add genres to songs
  const genre1 = await Genre.create({ name: 'Ambient', song_id: song1._id });
  const genre2 = await Genre.create({ name: 'Electronic', song_id: song2._id });

  // Like songs
  await Like.create({ user_id: user._id, song_id: song1._id });
  await Like.create({ user_id: user._id, song_id: song2._id });

  // Add to history (simulating user plays a song)
  await History.create({ user_id: user._id, song_id: song1._id });
  await History.create({ user_id: user._id, song_id: song2._id });

  console.log('🌱 Seed data inserted successfully!');
  mongoose.disconnect();
}

seed();
