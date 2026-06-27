const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine the folder dynamically.
    // If the path includes 'lifestyle' or folderType is explicitly set, use the lifestyle folder.
    let folder = 'divine-mane-naturals/products';
    if (
      (req.originalUrl && req.originalUrl.includes('lifestyle')) ||
      (req.body && req.body.folderType === 'lifestyle')
    ) {
      folder = 'divine-mane-naturals/lifestyle';
    }

    // Sanitize and generate unique public ID
    const filenameWithoutExt = file.originalname.substring(0, file.originalname.lastIndexOf('.')) || file.originalname;
    const sanitizedFilename = filenameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const publicId = `${sanitizedFilename}-${uniqueSuffix}`;

    return {
      folder: folder,
      public_id: publicId,
      allowed_formats: ['jpeg', 'jpg', 'png', 'webp', 'gif'],
    };
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = upload;
