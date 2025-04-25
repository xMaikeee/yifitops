(function() {
    const API = 'http://localhost:3000';
    const PAGE_SIZE = 5;  // items per page
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
  
    document.getElementById('logoutBtn').onclick = () => {
      localStorage.clear();
      window.location = 'index.html';
    };
  
    function registerPlayListener(audioEl, songId) {
      audioEl.addEventListener('play', async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        await fetch(`${API}/history`, {
          method: 'POST', headers,
          body: JSON.stringify({ user_id: user.id, song_id: songId })
        });
        await loadHistory();
      });
    }
  
    function renderPaginationControls(container, page, totalPages, onChange) {
      const controls = document.createElement('div');
      controls.className = 'pagination-controls';
      controls.innerHTML = `
        <button ${page===1?'disabled':''} id="prevBtn">Prev</button>
        <span>Page ${page} of ${totalPages}</span>
        <button ${page===totalPages?'disabled':''} id="nextBtn">Next</button>
      `;
      controls.querySelector('#prevBtn').onclick = () => onChange(page-1);
      controls.querySelector('#nextBtn').onclick = () => onChange(page+1);
      container.appendChild(controls);
    }
  
    async function loadSongs() {
      const res = await fetch(`${API}/songs`, { headers });
      allSongs = await res.json();
      const total = allSongs.length;
      const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
      songsPage = Math.min(Math.max(1, songsPage), totalPages);
  
      const slice = allSongs.slice((songsPage-1)*PAGE_SIZE, songsPage*PAGE_SIZE);
      const grid = document.getElementById('songs-grid');
      grid.className = 'grid';
      grid.innerHTML = '';
      slice.forEach(s => {
        const card = document.createElement('div'); card.className='song-card';
        card.innerHTML = `
          <h3>${s.song_name}</h3>
          <audio controls src="${API}${s.file_path}"></audio>
          <button onclick="addToFavorites('${s._id}')">❤</button>
          <button onclick="openPlaylistPrompt('${s._id}')">➕</button>
        `;
        grid.appendChild(card);
        registerPlayListener(card.querySelector('audio'), s._id);
      });
      renderPaginationControls(grid.parentNode, songsPage, totalPages, newPage => { songsPage=newPage; loadSongs(); });
    }
  
    async function loadFavorites() {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await fetch(`${API}/likes/${user.id}`, { headers });
      const favs = await res.json();
      favoritesData = favs.map(f => allSongs.find(s => s._id===f.song_id)).filter(Boolean);
      const totalPages = Math.ceil(favoritesData.length / PAGE_SIZE) || 1;
      favPage = Math.min(Math.max(1, favPage), totalPages);
      const slice = favoritesData.slice((favPage-1)*PAGE_SIZE, favPage*PAGE_SIZE);
      const grid = document.getElementById('favorites');
      grid.className = 'grid'; grid.innerHTML = '';
      slice.forEach(song => {
        const card = document.createElement('div'); card.className='song-card';
        card.innerHTML = `
          <h3>${song.song_name}</h3>
          <audio controls src="${API}${song.file_path}"></audio>
          <button onclick="removeFromFavorites('${user.id}','${song._id}')">✖</button>
        `;
        grid.appendChild(card);
        registerPlayListener(card.querySelector('audio'), song._id);
      });
      renderPaginationControls(grid.parentNode, favPage, totalPages, newPage => { favPage=newPage; loadFavorites(); });
    }
  
    async function loadPlaylists() {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await fetch(`${API}/playlists/${user.id}`, { headers });
      playlistsData = await res.json();
      const totalPages = Math.ceil(playlistsData.length / PAGE_SIZE) || 1;
      plPage = Math.min(Math.max(1, plPage), totalPages);
      const slice = playlistsData.slice((plPage-1)*PAGE_SIZE, plPage*PAGE_SIZE);
      const container = document.getElementById('playlists-list'); container.innerHTML = '';
      slice.forEach(pl => {
        const section = document.createElement('section'); section.className='playlist-item';
        section.innerHTML = `<h3>${pl.name}<button onclick="deletePlaylist('${pl._id}')">✖</button></h3>`;
        const grid = document.createElement('div'); grid.className='grid';
        pl.songs.forEach(sr => {
          const song = allSongs.find(s=>s._id===sr.song_id);
          if (song) {
            const card = document.createElement('div'); card.className='song-card';
            card.innerHTML = `
              <h4>${song.song_name}</h4>
              <audio controls src="${API}${song.file_path}"></audio>
              <button onclick="removeFromPlaylist('${pl._id}','${song._id}')">✖</button>
            `;
            grid.appendChild(card);
            registerPlayListener(card.querySelector('audio'), song._id);
          }
        });
        section.appendChild(grid);
        container.appendChild(section);
      });
      renderPaginationControls(container, plPage, totalPages, newPage => { plPage=newPage; loadPlaylists(); });
    }
  
    async function loadHistory() {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await fetch(`${API}/history/${user.id}`, { headers });
      const hist = await res.json();
      historyData = hist.map(h => allSongs.find(s=>s._id===h.song_id)).filter(Boolean);
      const totalPages = Math.ceil(historyData.length / PAGE_SIZE) || 1;
      histPage = Math.min(Math.max(1, histPage), totalPages);
      const slice = historyData.slice((histPage-1)*PAGE_SIZE, histPage*PAGE_SIZE);
      const grid = document.getElementById('history'); grid.className='grid'; grid.innerHTML='';
      slice.forEach(song => {
        const card = document.createElement('div'); card.className='song-card';
        card.innerHTML = `
          <h3>${song.song_name}</h3>
          <audio controls src="${API}${song.file_path}"></audio>
        `;
        grid.appendChild(card);
        registerPlayListener(card.querySelector('audio'), song._id);
      });
      renderPaginationControls(grid.parentNode, histPage, totalPages, newPage => { histPage=newPage; loadHistory(); });
    }
  
    async function openPlaylistPrompt(songId) {
      await loadPlaylists();
      const names = playlistsData.map((p,i)=>`${i+1}: ${p.name}`).join('\n');
      let input = names ? prompt(`Choose playlist by number or enter new name:\n${names}`) : prompt('Enter new playlist name:');
      if (!input) return;
      const idx = parseInt(input);
      const name = (!isNaN(idx) && idx>=1 && idx<=playlistsData.length) ? playlistsData[idx-1].name : input.trim();
      if (!name) return;
      const user = JSON.parse(localStorage.getItem('user'));
      await fetch(`${API}/playlists`, { method:'POST', headers, body: JSON.stringify({ name, user_id: user.id, song_id: songId, order: 1 }) });
      await loadPlaylists();
    }
  
    async function addToFavorites(songId) {
      const user = JSON.parse(localStorage.getItem('user'));
      await fetch(`${API}/likes`, { method:'POST', headers, body: JSON.stringify({ user_id: user.id, song_id: songId }) });
      await loadFavorites();
    }
  
    async function removeFromFavorites(userId, songId) {
      await fetch(`${API}/likes/${userId}/${songId}`, { method:'DELETE', headers });
      await loadFavorites();
    }
  
    async function removeFromPlaylist(plId, songId) {
      await fetch(`${API}/playlists/${plId}/songs/${songId}`, { method:'DELETE', headers });
      await loadPlaylists();
    }
  
    async function deletePlaylist(plId) {
      if (!confirm('Delete entire playlist?')) return;
      await fetch(`${API}/playlists/${plId}`, { method:'DELETE', headers });
      await loadPlaylists();
    }
  
    window.openPlaylistPrompt = openPlaylistPrompt;
    window.addToFavorites = addToFavorites;
    window.removeFromFavorites = removeFromFavorites;
    window.removeFromPlaylist = removeFromPlaylist;
    window.deletePlaylist = deletePlaylist;
  
    loadSongs().then(async () => {
      await loadFavorites();
      await loadPlaylists();
      await loadHistory();
    });
  })();