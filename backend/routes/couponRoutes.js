const express = require('express');
const router = express.Router();
const {
  applyCoupon,
  getCoupons,
  createCoupon,
} = require('../controllers/couponController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route
router.post('/apply', applyCoupon);

// Protected routes
router.get('/', authMiddleware, getCoupons);
router.post('/', authMiddleware, createCoupon);

module.exports = router;
