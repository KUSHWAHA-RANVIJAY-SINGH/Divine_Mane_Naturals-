const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const admin = require('../config/firebaseAdmin');

// @desc    Login admin user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Register admin user (Signup)
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Check if admin email already registered
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin email already registered.' });
    }

    const admin = await Admin.create({
      email: email.toLowerCase(),
      password,
    });

    // Generate JWT
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// @desc    Google login / signup for customers
// @route   POST /api/auth/google-login
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required.' });
    }

    // Verify token using firebase-admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, name, email, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({ message: 'Email address not provided by Google.' });
    }

    // Find or create customer in MongoDB
    let customer = await Customer.findOne({ firebaseUid: uid });
    if (!customer) {
      try {
        customer = await Customer.create({
          firebaseUid: uid,
          name: name || email.split('@')[0],
          email: email.toLowerCase(),
          photoURL: picture || '',
        });
        console.log(`👤 Created new customer account: ${customer.email}`);
      } catch (error) {
        if (error.code === 11000) {
          // Handle race condition: customer was created by a concurrent request
          customer = await Customer.findOne({ firebaseUid: uid });
          if (!customer) {
            // If the conflict was due to email uniqueness instead
            return res.status(400).json({ message: 'A customer account with this email already exists.' });
          }
        } else {
          throw error;
        }
      }
    } else {
      // Sync profile info if changed
      let updated = false;
      if (name && customer.name !== name) {
        customer.name = name;
        updated = true;
      }
      if (picture && customer.photoURL !== picture) {
        customer.photoURL = picture;
        updated = true;
      }
      if (updated) {
        await customer.save();
      }
    }
    // Auto-link any existing guest/unlinked orders with this email to this customer
    try {
      await Order.updateMany(
        { email: email.toLowerCase(), customerId: null },
        { customerId: customer._id }
      );
    } catch (dbErr) {
      console.error('Failed to auto-link past orders:', dbErr);
    }

    res.json({
      customer: {
        id: customer._id,
        firebaseUid: customer.firebaseUid,
        name: customer.name,
        email: customer.email,
        photoURL: customer.photoURL,
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ message: 'Authentication failed. Invalid token.' });
  }
};

module.exports = { login, signup, googleLogin };
