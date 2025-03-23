const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const authJwt = require('../middleware/authJwt');

// Create a new department (public endpoint)
router.post(
  '/',
  departmentController.createDepartment
);

// Get all departments (public endpoint)
router.get('/', departmentController.getAllDepartments);

// Get department by ID (public endpoint)
router.get('/:id', departmentController.getDepartmentById);

// Update department (admin only)
router.put(
  '/:id',
  [authJwt.verifyToken, authJwt.isAcademicDirectorOrExecutiveDirector],
  departmentController.updateDepartment
);

// Delete department (admin only)
router.delete(
  '/:id',
  [authJwt.verifyToken, authJwt.isAcademicDirectorOrExecutiveDirector],
  departmentController.deleteDepartment
);

module.exports = router;