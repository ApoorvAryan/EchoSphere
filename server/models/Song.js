const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Song title is required'],
    trim: true,
  },
  artist: {
    type: String,
    required: [true, 'Artist name is required'],
    trim: true,
  },
  album: {
    type: String,
    default: 'Unknown Album',
    trim: true,
  },
  genre: {
    type: String,
    default: 'Unknown',
    trim: true,
  },
  duration: {
    type: Number,
    default: 0,
  },
  audioUrl: {
    type: String,
    required: true,
  },
  audioPublicId: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    default: '',
  },
  thumbnailPublicId: {
    type: String,
    default: '',
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  plays: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

songSchema.index({ title: 'text', artist: 'text', album: 'text', genre: 'text' });

module.exports = mongoose.model('Song', songSchema);
