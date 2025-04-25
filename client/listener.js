(function() {
    const API = 'http://localhost:3000';
    const PAGE_SIZE = 5;
    const token = localStorage.getItem('token');
    if (!token) {
      window.location = 'index.html';
      return;
    }
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  
    let allSongs = [];
    let playlistsData = [];
    let favoritesData = [];
    let historyData = [];
  
    let songsPage = 1;
    let favPage = 1;
    let plPage = 1;
    let histPage = 1;
  
    // Search term for songs
    let searchTerm = '';
    const searchInput = document.getElementById('songSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        songsPage = 1;
        loadSongs();
      });
    }
  
    // Logout handler
    document.getElementById('logoutBtn').onclick = () => {
      localStorage.clear();
      window.location = 'index.html';
    };
  
    // Register play history on audio play
    function registerPlayListener(audioEl, songId) {
      audioEl.addEventListener('play', async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        await fetch(`${API}/history`, {
          method: 'POST', headers,
          body: JSON.stringify({ user_id: user.id, song_id: songId })
        });
        loadHistory();
      });
    }
  
    // Render pagination controls, clearing old ones
    function renderPaginationControls(container, page, totalPages, onChange) {
      // Remove existing controls
      container.querySelectorAll('.pagination-controls').forEach(el => el.remove());
      const controls = document.createElement('div');
      controls.className = 'pagination-controls';
      controls.innerHTML = `
        <button ${page === 1 ? 'disabled' : ''} class="prev-btn">Prev</button>
        <span>Page ${page} of ${totalPages}</span>
        <button ${page === totalPages ? 'disabled' : ''} class="next-btn">Next</button>
      `;
      controls.querySelector('.prev-btn').onclick = () => onChange(page - 1);
      controls.querySelector('.next-btn').onclick = () => onChange(page + 1);
      container.appendChild(controls);
    }
  
    // Load and render songs with search & pagination
    async function loadSongs() {
      const res = await fetch(`${API}/songs`, { headers });
      allSongs = await res.json();
      const filtered = searchTerm
        ? allSongs.filter(s => s.song_name.toLowerCase().includes(searchTerm))
        : allSongs;
  
      const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
      songsPage = Math.min(Math.max(1, songsPage), totalPages);
      const slice = filtered.slice((songsPage - 1) * PAGE_SIZE, songsPage * PAGE_SIZE);
  
      const grid = document.getElementById('songs-grid');
      grid.className = 'grid';
      grid.innerHTML = '';
  
      slice.forEach(s => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
          <h3>${s.song_name}</h3>
          ${s.image_path ? `<img src="${API}${s.image_path}" class="cover-thumb" alt="Cover for ${s.song_name}"/>` : ''}
          <audio controls src="${API}${s.file_path}"></audio>
          <button onclick="addToFavorites('${s._id}')">❤ Favorite</button>
          <button onclick="openPlaylistPrompt('${s._id}')">➕ Add to Playlist</button>
        `;
        const img = card.querySelector('img.cover-thumb');
        if (img) img.onerror = () => img.remove();
        grid.appendChild(card);
        registerPlayListener(card.querySelector('audio'), s._id);
      });
  
      renderPaginationControls(grid.parentNode, songsPage, totalPages, newPage => { songsPage = newPage; loadSongs(); });
    }
  
    // Load and render favorites with pagination
    async function loadFavorites() {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await fetch(`${API}/likes/${user.id}`, { headers });
      const favs = await res.json();
      favoritesData = favs.map(f => allSongs.find(s => s._id === f.song_id)).filter(Boolean);
  
      const totalPages = Math.ceil(favoritesData.length / PAGE_SIZE) || 1;
      favPage = Math.min(Math.max(1, favPage), totalPages);
      const slice = favoritesData.slice((favPage - 1) * PAGE_SIZE, favPage * PAGE_SIZE);
  
      const grid = document.getElementById('favorites');
      grid.className = 'grid';
      grid.innerHTML = '';
  
      slice.forEach(song => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
          <h3>${song.song_name}</h3>
          ${song.image_path ? `<img src="${API}${song.image_path}" class="cover-thumb" alt="Cover for ${song.song_name}"/>` : ''}
          <audio controls src="${API}${song.file_path}"></audio>
          <button onclick="removeFromFavorites('${user.id}','${song._id}')">✖ Remove</button>
        `;
        const img = card.querySelector('img.cover-thumb');
        if (img) img.onerror = () => img.remove();
        grid.appendChild(card);
        registerPlayListener(card.querySelector('audio'), song._id);
      });
  
      renderPaginationControls(grid.parentNode, favPage, totalPages, newPage => { favPage = newPage; loadFavorites(); });
    }
  
    // Load and render playlists with pagination
    async function loadPlaylists() {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await fetch(`${API}/playlists/${user.id}`, { headers });
      playlistsData = await res.json();
  
      const totalPages = Math.ceil(playlistsData.length / PAGE_SIZE) || 1;
      plPage = Math.min(Math.max(1, plPage), totalPages);
      const slice = playlistsData.slice((plPage - 1) * PAGE_SIZE, plPage * PAGE_SIZE);
  
      const container = document.getElementById('playlists-list');
      container.innerHTML = '';
  
      slice.forEach(pl => {
        const section = document.createElement('section');
        section.className = 'playlist-item';
        section.innerHTML = `
          <h3>${pl.name} <button onclick="deletePlaylist('${pl._id}')">✖ Delete</button></h3>
        `;
        const grid = document.createElement('div');
        grid.className = 'grid';
  
        pl.songs.forEach(sr => {
          const song = allSongs.find(s => s._id === sr.song_id);
          if (!song) return;
          const card = document.createElement('div');
          card.className = 'song-card';
          card.innerHTML = `
            <h4>${song.song_name}</h4>
            ${song.image_path ? `<img src="${API}${song.image_path}" class="cover-thumb" alt="Cover for ${song.song_name}"/>` : ''}
            <audio controls src="${API}${song.file_path}"></audio>
            <button onclick="removeFromPlaylist('${pl._id}','${song._id}')">✖ Remove</button>
          `;
          const img = card.querySelector('img.cover-thumb');
          if (img) img.onerror = () => img.remove();
          grid.appendChild(card);
          registerPlayListener(card.querySelector('audio'), song._id);
        });
  
        section.appendChild(grid);
        container.appendChild(section);
      });
  
      renderPaginationControls(container, plPage, totalPages, newPage => { plPage = newPage; loadPlaylists(); });
    }
  
    // Load and render history with pagination
    async function loadHistory() {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await fetch(`${API}/history/${user.id}`, { headers });
      const hist = await res.json();
      historyData = hist.map(h => allSongs.find(s => s._id === h.song_id)).filter(Boolean);
  
      const totalPages = Math.ceil(historyData.length / PAGE_SIZE) || 1;
      histPage = Math.min(Math.max(1, histPage), totalPages);
      const slice = historyData.slice((histPage - 1) * PAGE_SIZE, histPage * PAGE_SIZE);
  
      const grid = document.getElementById('history');
      grid.className = 'grid';
      grid.innerHTML = '';
  
      slice.forEach(song => {
        const record = hist.find(h => h.song_id === song._id);
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
          <h3>${song.song_name}</h3>
          ${song.image_path ? `<img src="${API}${song.image_path}" class="cover-thumb" alt="Cover for ${song.song_name}"/>` : ''}
          <audio controls src="${API}${song.file_path}"></audio>
          <p>Played: ${new Date(record.playedDate).toLocaleString()}</p>
        `;
        const img = card.querySelector('img.cover-thumb');
        if (img) img.onerror = () => img.remove();
        grid.appendChild(card);
        registerPlayListener(card.querySelector('audio'), song._id);
      });
  
      renderPaginationControls(grid.parentNode, histPage, totalPages, newPage => { histPage = newPage; loadHistory(); });
    }

    function loadDashboard() {
        document.getElementById('total-songs').textContent     = allSongs.length;
        document.getElementById('total-favorites').textContent = favoritesData.length;
        document.getElementById('total-playlists').textContent = playlistsData.length;
        document.getElementById('total-history').textContent   = historyData.length;
      }
      
      // In your initial load sequence, call it after data loads:
      loadSongs().then(async () => {
        await loadFavorites();
        await loadPlaylists();
        await loadHistory();
        loadDashboard();   // ← update dashboard counts
      });
  
    // Global action handlers
    window.openPlaylistPrompt = async songId => {
      await loadPlaylists();
      const names = playlistsData.map((p, i) => `${i + 1}: ${p.name}`).join('\n');
      const input = names
        ? prompt(`Choose playlist by number or new name:\n${names}`)
        : prompt('Enter new playlist name:');
      if (!input) return;
      const idx = parseInt(input);
      const name = !isNaN(idx) && idx >= 1 && idx <= playlistsData.length
        ? playlistsData[idx - 1].name
        : input.trim();
      const user = JSON.parse(localStorage.getItem('user'));
      await fetch(`${API}/playlists`, {
        method: 'POST', headers,
        body: JSON.stringify({ name, user_id: user.id, song_id: songId, order: 1 })
      });
      loadPlaylists();
    };
    window.addToFavorites = async songId => {
      const user = JSON.parse(localStorage.getItem('user'));
      await fetch(`${API}/likes`, {
        method: 'POST', headers,
        body: JSON.stringify({ user_id: user.id, song_id: songId })
      });
      loadFavorites();
    };
    window.removeFromFavorites = async (userId, songId) => {
      await fetch(`${API}/likes/${userId}/${songId}`, { method: 'DELETE', headers });
      loadFavorites();
    };
    window.removeFromPlaylist = async (plId, songId) => {
      await fetch(`${API}/playlists/${plId}/songs/${songId}`, { method: 'DELETE', headers });
      loadPlaylists();
    };
    window.deletePlaylist = async plId => {
      if (!confirm('Delete playlist?')) return;
      await fetch(`${API}/playlists/${plId}`, { method: 'DELETE', headers });
      loadPlaylists();
    };
  
    // Initial load
    loadSongs().then(async () => {
      await loadFavorites();
      await loadPlaylists();
      await loadHistory();
    });
  })();