const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verifySignUp = require('../middleware/verifySignUp');

// User registration endpoint
router.post(
  '/signup',
  [
    verifySignUp.checkDuplicateUsernameOrEmail,
    verifySignUp.checkRolesExisted
  ],
  authController.signup
);

// User login endpoint
router.post('/signin', authController.signin);

module.exports = router;