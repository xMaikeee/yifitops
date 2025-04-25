import { displayAuthForms, hideAuthForms } from './auth.js';
const API = 'http://localhost:3000';
let allSongs = [];

async function fetchGenres() {
  const res = await fetch(`${API}/genres`, authHeader());
  const genres = await res.json();
  const filter = document.getElementById('genreFilter');
  genres.forEach(g => filter.innerHTML += `<option value="${g._id}">${g.name}</option>`);
}

async function fetchAlbums() {
  const res = await fetch(`${API}/albums`, authHeader());
  const albums = await res.json();
  const filter = document.getElementById('albumFilter');
  albums.forEach(a => filter.innerHTML += `<option value="${a._id}">${a.name}</option>`);
}

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
}

async function loadSongs() {
  const res = await fetch(`${API}/songs`, authHeader());
  allSongs = await res.json();
  renderSongs(allSongs);
}

function renderSongs(songs) {
  const grid = document.getElementById('songs-grid');
  grid.innerHTML = songs.map(s => `
    <div class="song-card">
      <img src="${API}${s.file_path}" alt="${s.song_name}" />
      <h3>${s.song_name}</h3>
      <p>${s.length}s</p>
      <audio controls src="${API}${s.file_path}"></audio>
      <button onclick="addToFavorites('${s._id}')">❤</button>
    </div>`).join('');
}

document.getElementById('genreFilter').addEventListener('change', e => {
  const id = e.target.value;
  renderSongs(id ? allSongs.filter(s => s.genre_id === id) : allSongs);
});

document.getElementById('albumFilter').addEventListener('change', e => {
  const id = e.target.value;
  renderSongs(id ? allSongs.filter(s => s.album_id === id) : allSongs);
});

// Additional functions for playlists, etc.

async function init() {
  if (localStorage.getItem('token')) {
    hideAuthForms();
    document.getElementById('controls').style.display = 'flex';
    await fetchGenres();
    await fetchAlbums();
    await loadSongs();
  } else {
    displayAuthForms();
  }
}

init();