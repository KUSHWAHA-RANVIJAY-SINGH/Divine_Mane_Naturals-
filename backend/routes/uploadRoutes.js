const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    res.json({ url: req.file.path });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during file upload.' });
  }
}, (error, req, res, next) => {
  // Handle multer errors
  res.status(400).json({ message: error.message });
});

module.exports = router;
