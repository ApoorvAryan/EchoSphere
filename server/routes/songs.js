const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, adminOnly } = require('../middleware/auth');
const {
  uploadSong, getAllSongs, getSongById, deleteSong, searchSongs, incrementPlay, getTrendingSongs
} = require('../controllers/songController');

// Using Memory Storage for cross-compatibility (Local machine + Render/Vercel)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadFields = upload.fields([
  { name: 'audio', maxCount: 1 }, 
  { name: 'thumbnail', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]);

router.get('/search', searchSongs);
router.get('/trending', getTrendingSongs);
router.get('/', getAllSongs);
router.get('/:id', getSongById);
router.post('/', protect, uploadFields, uploadSong);
router.delete('/:id', protect, deleteSong);
router.post('/:id/play', protect, incrementPlay);

module.exports = router;