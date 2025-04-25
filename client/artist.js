(function() {
    const API = 'http://localhost:3000';
    const token = localStorage.getItem('token');
    if (!token) {
      window.location = 'index.html';
      return;
    }
    const headers = { 'Authorization': `Bearer ${token}` };
  
    // Logout handler
    document.getElementById('logoutBtn').onclick = () => {
      localStorage.clear();
      window.location = 'index.html';
    };
  
    // Song + Cover upload
    async function handleUpload(e) {
      e.preventDefault();
      try {
        const form = document.getElementById('uploadForm');
        const fd = new FormData(form);
        const res = await fetch(`${API}/songs/upload`, {
          method: 'POST',
          headers,  // only Authorization, no Content-Type
          body: fd
        });
        const data = await res.json();
        console.log('Upload response:', data);
        if (res.ok) {
          alert(`Uploaded: ${data.song_name}`);
          form.reset();
          loadMySongs();
        } else {
          alert(`Error: ${data.error || 'Upload failed'}`);
        }
      } catch (err) {
        console.error('Upload exception:', err);
        alert('Upload error, see console');
      }
    }
    document.getElementById('uploadForm').addEventListener('submit', handleUpload);
  
    // Load artist's songs into grid with checkboxes
    async function loadMySongs() {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const res = await fetch(`${API}/songs`, { headers });
        const songs = await res.json();
        console.log('Songs from server:', songs);
        const grid = document.getElementById('my-songs-grid');
        grid.className = 'grid';
        grid.innerHTML = '';
  
        songs
          .filter(s => String(s.artist_id) === user.id)
          .forEach(s => {
            const card = document.createElement('div');
            card.className = 'song-card';
            card.innerHTML = `
              <input type="checkbox" class="song-checkbox" value="${s._id}" />
              <h3>${s.song_name}</h3>
              ${s.image_path ? `<img src="${API}${s.image_path}" class="cover-thumb" alt="Cover for ${s.song_name}"/>` : ''}
              <audio controls src="${API}${s.file_path}"></audio>
              <button class="delete-btn" onclick="deleteSong('${s._id}')">Delete</button>
            `;
            const img = card.querySelector('img.cover-thumb');
            if (img) {
              img.onerror = () => {
                console.error('Cover load failed:', img.src);
                img.style.display = 'none';
              };
            }
            grid.appendChild(card);
          });
      } catch (err) {
        console.error('Error loading songs:', err);
        document.getElementById('my-songs-grid').innerHTML = '<p>Error loading songs.</p>';
      }
    }
  
    // Delete single song
    async function deleteSong(id) {
      if (!confirm('Delete this song?')) return;
      const res = await fetch(`${API}/songs/${id}`, { method: 'DELETE', headers });
      if (res.ok) loadMySongs(); else alert('Delete failed');
    }
    window.deleteSong = deleteSong;
  
    // Bulk delete setup
    function setupBulkActions() {
      document.getElementById('selectAllBtn').onclick = () => {
        document.querySelectorAll('.song-checkbox').forEach(cb => cb.checked = true);
      };
      document.getElementById('deleteSelectedBtn').onclick = async () => {
        const selected = Array.from(document.querySelectorAll('.song-checkbox:checked'))
          .map(cb => cb.value);
        if (!selected.length) return alert('No songs selected');
        if (!confirm(`Delete ${selected.length} songs?`)) return;
        const res = await fetch(`${API}/songs`, {
          method: 'DELETE',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selected })
        });
        const data = await res.json();
        alert(data.message || 'Bulk delete complete');
        loadMySongs();
      };
    }
  
    // Load artist's albums
    async function loadAlbums() {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await fetch(`${API}/albums`, { headers });
      const albums = await res.json();
      const list = document.getElementById('albums-list');
      list.innerHTML = '';
      albums.filter(a => a.artist_id === user.id)
        .forEach(a => {
          const div = document.createElement('div');
          div.textContent = a.name;
          list.appendChild(div);
        });
    }
  
    // Initialize
    loadMySongs().then(() => {
      setupBulkActions();
      loadAlbums();
    });
  })();