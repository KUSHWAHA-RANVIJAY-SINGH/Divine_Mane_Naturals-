require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const Product = require('../models/Product');

const IMAGE_DIR = path.join(__dirname, '../../frontend/Image');

const productMapping = [
  {
    productName: 'Gentle Cleansing Shampoo',
    fileName: 'WhatsApp Image 2026-06-20 at 1.14.24 AM (1).jpeg',
    publicId: 'shampoo',
  },
  {
    productName: 'Pigment Combat Leave-In Conditioner',
    fileName: 'WhatsApp Image 2026-06-20 at 1.14.27 AM.jpeg',
    publicId: 'leave-in',
  },
  {
    productName: 'Choco-Mint Butter Cream',
    fileName: 'WhatsApp Image 2026-06-20 at 1.14.23 AM (1).jpeg',
    publicId: 'butter-cream',
  },
  {
    productName: 'Divine Hair Growth Oil',
    fileName: 'WhatsApp Image 2026-06-20 at 1.14.23 AM.jpeg',
    publicId: 'growth-oil',
  },
];

const lifestyleMapping = [
  {
    key: 'founder-portrait',
    fileName: 'WhatsApp Image 2026-06-20 at 1.14.25 AM (2).jpeg',
    publicId: 'founder-portrait',
  },
  {
    key: 'hero-bg',
    fileName: 'WhatsApp Image 2026-06-20 at 1.14.25 AM.jpeg',
    publicId: 'hero-bg',
  },
  {
    key: 'product-range',
    fileName: 'WhatsApp Image 2026-06-20 at 1.14.25 AM.jpeg',
    publicId: 'product-range',
  },
  {
    key: 'lifestyle-1',
    fileName: 'WhatsApp Image 2026-06-20 at 1.14.23 AM (2).jpeg',
    publicId: 'lifestyle-1',
  },
  {
    key: 'lifestyle-2',
    fileName: 'WhatsApp Image 2026-06-20 at 1.14.24 AM.jpeg',
    publicId: 'lifestyle-2',
  },
  {
    key: 'lifestyle-3',
    fileName: 'WhatsApp Image 2026-06-20 at 1.14.24 AM (1).jpeg',
    publicId: 'lifestyle-3',
  },
];

const migrate = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    console.log('\n--- MIGRATING PRODUCT IMAGES ---');
    for (const item of productMapping) {
      const filePath = path.join(IMAGE_DIR, item.fileName);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${filePath}, skipping product "${item.productName}"`);
        continue;
      }

      console.log(`Uploading ${item.fileName} for product "${item.productName}"...`);
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        folder: 'divine-mane-naturals/products',
        public_id: item.publicId,
        overwrite: true,
      });

      console.log(`Cloudinary Upload Success: ${uploadResult.secure_url}`);

      // Update product in DB
      const product = await Product.findOne({ name: item.productName });
      if (product) {
        product.image = uploadResult.secure_url;
        product.imagePublicId = uploadResult.public_id;
        await product.save();
        console.log(`✅ DB updated for product: "${item.productName}"`);
      } else {
        console.warn(`⚠️ Product not found in DB: "${item.productName}"`);
      }
    }

    console.log('\n--- MIGRATING LIFESTYLE IMAGES ---');
    const lifestyleUrls = {};
    for (const item of lifestyleMapping) {
      const filePath = path.join(IMAGE_DIR, item.fileName);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${filePath}, skipping lifestyle key "${item.key}"`);
        continue;
      }

      console.log(`Uploading ${item.fileName} as lifestyle "${item.key}"...`);
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        folder: 'divine-mane-naturals/lifestyle',
        public_id: item.publicId,
        overwrite: true,
      });

      console.log(`Cloudinary Upload Success: ${uploadResult.secure_url}`);
      lifestyleUrls[item.key] = uploadResult.secure_url;
    }

    console.log('\n--- MIGRATION SUMMARY & LIFESTYLE URLS ---');
    console.log(JSON.stringify(lifestyleUrls, null, 2));

    console.log('\n✅ All migrations completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrate();
