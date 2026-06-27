const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ category: 1, createdAt: 1 });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Protected (admin)
const createProduct = async (req, res) => {
  try {
    const { name, category, tagline, benefit, price } = req.body;

    let imageUrl = '/products/placeholder.jpg';
    let imagePublicId = '';

    if (req.file) {
      imageUrl = req.file.path; // Cloudinary secure URL
      imagePublicId = req.file.filename; // Cloudinary public ID
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    let parsedPrice = null;
    if (price !== undefined && price !== null && price !== '' && price !== 'null') {
      parsedPrice = parseFloat(price);
    }

    const product = await Product.create({
      name,
      category,
      tagline: tagline || '',
      benefit,
      price: parsedPrice,
      image: imageUrl,
      imagePublicId,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Protected (admin)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const { name, category, tagline, benefit, price } = req.body;

    product.name = name ?? product.name;
    product.category = category ?? product.category;
    product.tagline = tagline ?? product.tagline;
    product.benefit = benefit ?? product.benefit;
    
    if (price !== undefined) {
      product.price = (price === '' || price === 'null' || price === null) ? null : parseFloat(price);
    }

    // Check if new file was uploaded
    if (req.file) {
      const oldPublicId = product.imagePublicId;
      product.image = req.file.path; // Cloudinary secure URL
      product.imagePublicId = req.file.filename; // Cloudinary public ID

      // Clean up the old image from Cloudinary
      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(oldPublicId);
        } catch (err) {
          console.error('Failed to delete old image from Cloudinary:', err);
        }
      }
    } else if (req.body.image !== undefined) {
      product.image = req.body.image ?? product.image;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Protected (admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Delete image from Cloudinary
    if (product.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(product.imagePublicId);
      } catch (err) {
        console.error('Failed to delete image from Cloudinary:', err);
      }
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

