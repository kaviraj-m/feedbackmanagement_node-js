const db = require('../models');
const Department = db.department;

// Create a new department
exports.createDepartment = async (req, res) => {
  try {
    // Validate request
    if (!req.body.name) {
      return res.status(400).send({
        message: 'Department name is required!'
      });
    }

    // Create department object
    const department = {
      name: req.body.name,
      description: req.body.description || null,
      active: req.body.active !== undefined ? req.body.active : true,
      roleId: req.body.roleId || 1 // Default to role ID 1 if not provided
    };

    // Check if department with same name already exists
    const existingDepartment = await Department.findOne({
      where: { name: department.name }
    });

    if (existingDepartment) {
      return res.status(400).send({
        message: 'Department with this name already exists!'
      });
    }

    // Save department in the database
    const data = await Department.create(department);
    res.status(201).send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while creating the department.'
    });
  }
};

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll();
    res.status(200).send(departments);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred while retrieving departments.'
    });
  }
};

// Get department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const id = req.params.id;
    const department = await Department.findByPk(id);
    
    if (!department) {
      return res.status(404).send({
        message: `Department with id=${id} not found`
      });
    }
    
    res.status(200).send(department);
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving department with id=${req.params.id}`
    });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if department exists
    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).send({
        message: `Department with id=${id} not found`
      });
    }
    
    // If updating name, check if new name already exists
    if (req.body.name && req.body.name !== department.name) {
      const existingDepartment = await Department.findOne({
        where: { name: req.body.name }
      });
      
      if (existingDepartment) {
        return res.status(400).send({
          message: 'Department with this name already exists!'
        });
      }
    }
    
    // Update department
    const num = await Department.update(req.body, {
      where: { id: id }
    });
    
    if (num == 1) {
      res.send({
        message: 'Department was updated successfully.'
      });
    } else {
      res.send({
        message: `Cannot update department with id=${id}. Maybe department was not found or req.body is empty!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error updating department with id=${req.params.id}`
    });
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if department exists
    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).send({
        message: `Department with id=${id} not found`
      });
    }
    
    // Check if department has associated users or questions
    const usersCount = await department.countUsers();
    const questionsCount = await department.countQuestions();
    
    if (usersCount > 0 || questionsCount > 0) {
      return res.status(400).send({
        message: 'Cannot delete department because it has associated users or questions'
      });
    }
    
    // Delete department
    const num = await Department.destroy({
      where: { id: id }
    });
    
    if (num == 1) {
      res.send({
        message: 'Department was deleted successfully!'
      });
    } else {
      res.send({
        message: `Cannot delete department with id=${id}. Maybe department was not found!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Could not delete department with id=${req.params.id}`
    });
  }
};