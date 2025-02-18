const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authJwt = require('../middleware/authJwt');

// Get current user profile
router.get('/profile', [authJwt.verifyToken], userController.getCurrentUser);

// Get all users (admin only)
router.get(
  '/all',
  [authJwt.verifyToken, authJwt.isAcademicDirectorOrExecutiveDirector],
  userController.getAllUsers
);

// Get user by ID
router.get('/:id', [authJwt.verifyToken], userController.getUserById);

// Update user
router.put('/:id', [authJwt.verifyToken], userController.updateUser);

// Delete user (admin only)
router.delete(
  '/:id',
  [authJwt.verifyToken, authJwt.isAcademicDirectorOrExecutiveDirector],
  userController.deleteUser
);

// Get users by department
router.get(
  '/department/:departmentId',
  [authJwt.verifyToken, authJwt.isAcademicDirectorOrExecutiveDirector],
  userController.getUsersByDepartment
);

// Get users by year
router.get(
  '/year/:year',
  [authJwt.verifyToken, authJwt.isAcademicDirectorOrExecutiveDirector],
  userController.getUsersByYear
);

module.exports = router;