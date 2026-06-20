const Product = require('../models/Product');

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
    const { name, category, tagline, benefit, price, image } = req.body;

    const product = await Product.create({
      name,
      category,
      tagline: tagline || '',
      benefit,
      price: price || null,
      image: image || '/products/placeholder.jpg',
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

    const { name, category, tagline, benefit, price, image } = req.body;

    product.name = name ?? product.name;
    product.category = category ?? product.category;
    product.tagline = tagline ?? product.tagline;
    product.benefit = benefit ?? product.benefit;
    product.price = price !== undefined ? price : product.price;
    product.image = image ?? product.image;

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
