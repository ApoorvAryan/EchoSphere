const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { toggleFavorite, getFavorites, checkFavorite } = require('../controllers/favoriteController');

router.use(protect);
router.get('/', getFavorites);
router.post('/:songId', toggleFavorite);
router.get('/:songId/check', checkFavorite);

module.exports = router;
