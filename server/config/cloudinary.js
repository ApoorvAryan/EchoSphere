const cloudinary = require('cloudinary').v2;
const CloudinaryStorage  = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'echosphere/audio',
    resource_type: 'video', // Cloudinary uses 'video' for audio
    allowed_formats: ['mp3', 'wav', 'ogg', 'flac'],
  },
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'echosphere/images',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill' }],
  },
});

const uploadAudio = multer({ storage: audioStorage });
const uploadImage = multer({ storage: imageStorage });

module.exports = { cloudinary, uploadAudio, uploadImage };
