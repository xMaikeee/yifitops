const userId = "680a41654d4658c0dfe0a523";

async function loadSongs() {
    const res = await fetch('http://localhost:3000/songs');
    const songs = await res.json();
    const player = document.getElementById('player-controls');
    player.innerHTML = ''; // Clear existing content
  
    songs.forEach(song => {
      const div = document.createElement('div');
      div.textContent = `${song.song_name} (${song.length}s)`;
  
      // Create an audio element
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.src = `http://localhost:3000${song.file_path}`; // Set the song file URL
  
      // Append song and audio player
      player.appendChild(div);
      player.appendChild(audio);
    });
  }  

async function loadFavorites() {
  const res = await fetch(`http://localhost:3000/likes/${userId}`);
  const favorites = await res.json();
  const favList = document.getElementById('favorites');
  favList.innerHTML = '';
  favorites.forEach(fav => {
    const li = document.createElement('li');
    li.textContent = `Song ID: ${fav.song_id}`;
    favList.appendChild(li);
  });
}

async function loadHistory() {
  const res = await fetch(`http://localhost:3000/history/${userId}`);
  const history = await res.json();
  const historyList = document.getElementById('history');
  historyList.innerHTML = '';
  history.forEach(record => {
    const li = document.createElement('li');
    li.textContent = `Played Song ID: ${record.song_id} on ${new Date(record.playedDate).toLocaleString()}`;
    historyList.appendChild(li);
  });
}

async function handleUpload(event) {
  event.preventDefault();
  const form = document.getElementById('uploadForm');
  const formData = new FormData(form);
  const res = await fetch('http://localhost:3000/songs/upload', {
    method: 'POST',
    body: formData
  });
  const result = await res.json();
  alert(`Uploaded: ${result.song_name}`);
  form.reset();
  loadSongs();
}

document.getElementById('uploadForm').addEventListener('submit', handleUpload);

loadSongs();
loadFavorites();
loadHistory();
