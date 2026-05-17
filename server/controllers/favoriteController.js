const Favorite = require('../models/Favorite');
const Song = require('../models/Song');

const toggleFavorite = async (req, res) => {
  try {
    const { songId } = req.params;
    const existing = await Favorite.findOne({ user: req.user._id, song: songId });
    if (existing) {
      await existing.deleteOne();
      await Song.findByIdAndUpdate(songId, { $inc: { likes: -1 } });
      return res.json({ favorited: false, message: 'Removed from favorites' });
    }
    await Favorite.create({ user: req.user._id, song: songId });
    await Song.findByIdAndUpdate(songId, { $inc: { likes: 1 } });
    res.json({ favorited: true, message: 'Added to favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate('song', 'title artist thumbnailUrl audioUrl duration plays likes')
      .sort({ createdAt: -1 });
    res.json(favorites.map((f) => f.song));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkFavorite = async (req, res) => {
  try {
    const { songId } = req.params;
    const exists = await Favorite.findOne({ user: req.user._id, song: songId });
    res.json({ favorited: !!exists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { toggleFavorite, getFavorites, checkFavorite };
