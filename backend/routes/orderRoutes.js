const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route
router.post('/', createOrder);

// Protected routes
router.get('/', authMiddleware, getOrders);
router.patch('/:id', authMiddleware, updateOrderStatus);

module.exports = router;
