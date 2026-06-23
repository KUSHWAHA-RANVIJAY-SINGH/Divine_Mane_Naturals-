const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Register a new client user
// @route   POST /api/users/signup
// @access  Public
const signupUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields (name, email, phone, password) are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
    });

    // Generate user JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '30d' } // Users stay logged in longer
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('User signup error:', error);
    res.status(500).json({ message: 'Server error during signup.' });
  }
};

// @desc    Login client user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate user JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// @desc    Get user order history
// @route   GET /api/users/orders
// @access  Protected (User)
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders.' });
  }
};

module.exports = {
  signupUser,
  loginUser,
  getUserOrders,
};
