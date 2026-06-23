const express = require('express');
const router = express.Router();
const {
  signupUser,
  loginUser,
  getUserOrders,
} = require('../controllers/userController');
const userAuthMiddleware = require('../middleware/userAuthMiddleware');

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.get('/orders', userAuthMiddleware, getUserOrders);

module.exports = router;
