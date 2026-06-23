const express = require('express');
const router = express.Router();
const {
  applyCoupon,
  getCoupons,
  createCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route
router.post('/apply', applyCoupon);

// Protected routes
router.get('/', authMiddleware, getCoupons);
router.post('/', authMiddleware, createCoupon);
router.delete('/:id', authMiddleware, deleteCoupon);

module.exports = router;
