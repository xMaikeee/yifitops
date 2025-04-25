(function() {
    const API = 'http://localhost:3000';
    const token = localStorage.getItem('token');
    if (!token) {
      window.location = 'index.html';
      return;
    }
    const headers = { 'Authorization': `Bearer ${token}` };
  
    // Handle logout
    document.getElementById('logoutBtn').onclick = () => {
      localStorage.clear();
      window.location = 'index.html';
    };
  
    // Handle song + cover upload without manually setting Content-Type
    async function handleUpload(e) {
      e.preventDefault();
      try {
        const form = document.getElementById('uploadForm');
        const fd = new FormData(form);
        // Do not set Content-Type header explicitly; let browser handle multipart boundary
        const res = await fetch(`${API}/songs/upload`, {
          method: 'POST',
          headers,  // only Authorization header
          body: fd
        });
        const data = await res.json();
        console.log('Upload response:', data);
        if (res.ok) {
          alert(`Uploaded: ${data.song_name}`);
          form.reset();
          loadMySongs();
        } else {
          console.error('Upload failed response:', data);
          alert(`Error: ${data.error || 'Upload failed'}`);
        }
      } catch (err) {
        console.error('Upload exception:', err);
        alert('Upload error, check console for details');
      }
    }
    document.getElementById('uploadForm').addEventListener('submit', handleUpload);
  
    // Load artist's songs and render with cover image
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
          .filter(s => s.artist_id && String(s.artist_id) === user.id)
          .forEach(s => {
            const card = document.createElement('div');
            card.className = 'song-card';
            card.innerHTML = `
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
        const grid = document.getElementById('my-songs-grid');
        grid.innerHTML = '<p>Error loading songs. Check console.</p>';
      }
    }
  
    // Load artist's albums (unchanged)
    async function loadAlbums() {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await fetch(`${API}/albums`, { headers });
      const albums = await res.json();
      const list = document.getElementById('albums-list');
      list.innerHTML = '';
      albums
        .filter(a => a.artist_id === user.id)
        .forEach(a => {
          const div = document.createElement('div');
          div.textContent = a.name;
          list.appendChild(div);
        });
    }
  
    // Delete a song by ID
    async function deleteSong(id) {
      if (!confirm('Are you sure you want to delete this song?')) return;
      const res = await fetch(`${API}/songs/${id}`, { method: 'DELETE', headers });
      if (res.ok) loadMySongs();
      else alert('Delete failed');
    }
    window.deleteSong = deleteSong;
  
    // Initial load
    loadMySongs();
    loadAlbums();
  })();