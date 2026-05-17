const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createPlaylist, getUserPlaylists, getPlaylistById,
  addSongToPlaylist, removeSongFromPlaylist, deletePlaylist
} = require('../controllers/playlistController');

router.use(protect);
router.get('/', getUserPlaylists);
router.post('/', createPlaylist);
router.get('/:id', getPlaylistById);
router.delete('/:id', deletePlaylist);
router.post('/:id/songs', addSongToPlaylist);
router.delete('/:id/songs/:songId', removeSongFromPlaylist);

module.exports = router;
