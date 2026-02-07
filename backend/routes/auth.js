const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/register', registerUser); // must be a function
router.post('/login', loginUser);
router.get('/me', authMiddleware, getUserProfile);

module.exports = router;
