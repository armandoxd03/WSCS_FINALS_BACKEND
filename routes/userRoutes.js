const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../auth');

// User registration and login
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// User profile routes
router.get('/details', auth.verify, userController.getProfile);
router.patch('/update-profile', auth.verify, userController.updateProfile);
router.patch('/reset-password', auth.verify, userController.resetPassword);
router.post('/check-email', userController.checkEmailExists);

// Admin routes
router.patch('/:id/set-as-admin', auth.verify, auth.verifyAdmin, userController.setAsAdmin);

module.exports = router;