const admin = require('../config/firebaseAdmin');
const Customer = require('../models/Customer');

const customerAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required. Please sign in.' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the Firebase ID Token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (err) {
      console.error('Firebase token verification error:', err);
      return res.status(401).json({ message: 'Session expired or invalid. Please sign in again.' });
    }

    // Find customer in MongoDB matching the verified Firebase UID
    const customer = await Customer.findOne({ firebaseUid: decodedToken.uid });
    if (!customer) {
      return res.status(404).json({ message: 'Customer account not found. Please log in first.' });
    }

    // Attach decoded token and customer database document to request object
    req.firebaseUser = decodedToken;
    req.customer = customer;
    next();
  } catch (error) {
    console.error('Customer Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server authorization error.' });
  }
};

module.exports = customerAuth;
