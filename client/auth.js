const API_URL = 'http://localhost:3000';
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const { email, password } = Object.fromEntries(new FormData(loginForm));
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location = data.user.role === 'artist' ? 'artist.html' : 'listener.html';
  } else alert(data.error || 'Login failed');
});

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const { name, email, password, birth_date, role } = Object.fromEntries(new FormData(signupForm));
  const res = await fetch(`${API_URL}/auth/register`, {
    method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, email, password, birth_date, role })
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location = data.user.role === 'artist' ? 'artist.html' : 'listener.html';
  } else alert(data.error || 'Signup failed');
});