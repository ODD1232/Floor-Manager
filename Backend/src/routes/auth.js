const express = require('express');

const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');  // ADD THIS

// router.post('/register', authController.register);
router.post('/admin-register', auth, authController.adminRegister);  // PROTECTED ← HERE
router.post('/login', authController.login);

module.exports = router;