import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('echo_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('echo_token');
      localStorage.removeItem('echo_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);

// Songs
export const getAllSongs = (page = 1) => API.get(`/songs?page=${page}`);
export const getSong = (id) => API.get(`/songs/${id}`);
export const searchSongs = (q) => API.get(`/songs/search?q=${q}`);
export const getTrending = () => API.get('/songs/trending');
export const uploadSong = (formData) => API.post('/songs', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteSong = (id) => API.delete(`/songs/${id}`);
export const incrementPlay = (id) => API.post(`/songs/${id}/play`);

// Playlists
export const getPlaylists = () => API.get('/playlists');
export const createPlaylist = (data) => API.post('/playlists', data);
export const getPlaylist = (id) => API.get(`/playlists/${id}`);
export const deletePlaylist = (id) => API.delete(`/playlists/${id}`);
export const addToPlaylist = (playlistId, songId) => API.post(`/playlists/${playlistId}/songs`, { songId });
export const removeFromPlaylist = (playlistId, songId) => API.delete(`/playlists/${playlistId}/songs/${songId}`);

// Favorites
export const getFavorites = () => API.get('/favorites');
export const toggleFavorite = (songId) => API.post(`/favorites/${songId}`);
export const checkFavorite = (songId) => API.get(`/favorites/${songId}/check`);

// Admin
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminUsers = () => API.get('/admin/users');
export const deleteAdminUser = (id) => API.delete(`/admin/users/${id}`);

export default API;
