const Song = require('../models/Song');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const path = require('path');

const uploadSong = async (req, res) => {
  try {
    const { title, artist, album, genre, duration } = req.body;
    
    if (!req.files || !req.files.audio) {
      return res.status(400).json({ message: 'Audio file is required' });
    }
    
    const audioFile = req.files.audio[0];
    const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : (req.files.image ? req.files.image[0] : null);

    console.log("-> Streaming files via RAM buffer to Cloudinary...");

    const formatBufferToDataUri = (file) => {
      const extName = path.extname(file.originalname).toString();
      const base64Content = file.buffer.toString('base64');
      return `data:${file.mimetype};base64,${base64Content}`;
    };

    // 1. Format and Upload Audio
    const audioDataUri = formatBufferToDataUri(audioFile);
    const audioResult = await cloudinary.uploader.upload(audioDataUri, {
      resource_type: 'video', 
      folder: 'echosphere/audio'
    });

    // 2. Format and Upload Thumbnail (if present)
    let thumbnailResult = null;
    if (thumbnailFile) {
      const thumbnailDataUri = formatBufferToDataUri(thumbnailFile);
      thumbnailResult = await cloudinary.uploader.upload(thumbnailDataUri, {
        folder: 'echosphere/images'
      });
    }

    // 3. Save into MongoDB Database
    const song = await Song.create({
      title,
      artist,
      album: album || 'Unknown Album',
      genre: genre || 'Unknown',
      duration: duration || 0,
      audioUrl: audioResult.secure_url,
      audioPublicId: audioResult.public_id,
      thumbnailUrl: thumbnailResult ? thumbnailResult.secure_url : '',
      thumbnailPublicId: thumbnailResult ? thumbnailResult.public_id : '',
      uploadedBy: req.user._id,
    });

    res.status(201).json(song);
  } catch (error) {
    console.error("Upload Error Logged:", error);
    res.status(500).json({ message: error.message });
  }
};

const getAllSongs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const songs = await Song.find()
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Song.countDocuments();
    res.json({ songs, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate('uploadedBy', 'username');
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    if (song.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this song' });
    }

    if (song.audioPublicId) {
      await cloudinary.uploader.destroy(song.audioPublicId, { resource_type: 'video' });
    }
    if (song.thumbnailPublicId) {
      await cloudinary.uploader.destroy(song.thumbnailPublicId);
    }

    await song.deleteOne();
    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchSongs = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const songs = await Song.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { artist: { $regex: q, $options: 'i' } },
        { album: { $regex: q, $options: 'i' } },
        { genre: { $regex: q, $options: 'i' } },
      ],
    }).populate('uploadedBy', 'username').limit(20);
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const incrementPlay = async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(req.params.id, { $inc: { plays: 1 } }, { new: true });
    if (!song) return res.status(404).json({ message: 'Song not found' });

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { recentlyPlayed: { song: req.params.id } },
    });
    await User.findByIdAndUpdate(req.user._id, {
      $push: { recentlyPlayed: { $each: [{ song: req.params.id }], $position: 0, $slice: 20 } },
    });

    res.json({ plays: song.plays });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTrendingSongs = async (req, res) => {
  try {
    const songs = await Song.find().sort({ plays: -1 }).limit(10).populate('uploadedBy', 'username');
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CRUCIAL: Exports all functions explicitly so songs.js can access them
module.exports = { 
  uploadSong, 
  getAllSongs, 
  getSongById, 
  deleteSong, 
  searchSongs, 
  incrementPlay, 
  getTrendingSongs 
};