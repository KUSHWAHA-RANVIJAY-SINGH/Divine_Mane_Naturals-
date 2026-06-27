const express = require('express');
const router = express.Router();
const { login, signup, googleLogin } = require('../controllers/authController');

router.post('/login', login);
router.post('/signup', signup);
router.post('/google-login', googleLogin);

module.exports = router;
