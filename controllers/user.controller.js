const db = require('../models');
const User = db.user;
const Role = db.role;
const Department = db.department;

// Get all users (for admin purposes)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Role,
          as: 'roles',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ],
      attributes: { exclude: ['password'] }
    });

    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: Role,
          as: 'roles',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [
        {
          model: Role,
          as: 'roles',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Check if the requesting user has permission to update this user
    if (req.userId !== user.id && !req.userRoles.includes('ROLE_ACADEMIC_DIRECTOR') && !req.userRoles.includes('ROLE_EXECUTIVE_DIRECTOR')) {
      return res.status(403).send({ message: 'Unauthorized to update this user' });
    }

    // Update user fields
    await user.update({
      fullName: req.body.fullName || user.fullName,
      email: req.body.email || user.email,
      year: req.body.year || user.year,
      sinNumber: req.body.sinNumber || user.sinNumber,
      active: req.body.active !== undefined ? req.body.active : user.active
    });

    // Update department if provided
    if (req.body.departmentId) {
      const department = await Department.findByPk(req.body.departmentId);
      if (!department) {
        return res.status(404).send({ message: 'Department not found' });
      }
      await user.setDepartment(department);
    }

    // Get updated user with associations
    const updatedUser = await User.findByPk(user.id, {
      include: [
        {
          model: Role,
          as: 'roles',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ],
      attributes: { exclude: ['password'] }
    });

    res.status(200).send({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Check if the requesting user has permission to delete this user
    if (!req.userRoles.includes('ROLE_ACADEMIC_DIRECTOR') && !req.userRoles.includes('ROLE_EXECUTIVE_DIRECTOR')) {
      return res.status(403).send({ message: 'Unauthorized to delete users' });
    }

    await user.destroy();

    res.status(200).send({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    // Validate request
    if (!req.body.oldPassword || !req.body.newPassword) {
      return res.status(400).send({ message: 'Old password and new password are required' });
    }

    const userId = req.params.id || req.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Check if the requesting user has permission to change this user's password
    if (req.userId !== user.id && !req.userRoles.includes('ROLE_ACADEMIC_DIRECTOR') && !req.userRoles.includes('ROLE_EXECUTIVE_DIRECTOR')) {
      return res.status(403).send({ message: 'Unauthorized to change this user\'s password' });
    }

    // Verify old password
    const bcrypt = require('bcryptjs');
    const passwordIsValid = bcrypt.compareSync(req.body.oldPassword, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({ message: 'Invalid old password' });
    }

    // Update password
    await user.update({
      password: bcrypt.hashSync(req.body.newPassword, 8)
    });

    res.status(200).send({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Update user roles
exports.updateUserRoles = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Check if the requesting user has permission to update roles
    if (!req.userRoles.includes('ROLE_EXECUTIVE_DIRECTOR')) {
      return res.status(403).send({ message: 'Unauthorized to update user roles' });
    }

    // Validate roles
    if (!req.body.roles || !Array.isArray(req.body.roles) || req.body.roles.length === 0) {
      return res.status(400).send({ message: 'Roles must be a non-empty array' });
    }

    // Check if roles exist
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!db.ROLES.includes(req.body.roles[i])) {
        return res.status(400).send({
          message: `Role ${req.body.roles[i]} does not exist!`
        });
      }
    }

    // Find roles
    const roles = await Role.findAll({
      where: {
        name: {
          [db.Sequelize.Op.in]: req.body.roles
        }
      }
    });

    // Set new roles
    await user.setRoles(roles);

    // Get updated user with associations
    const updatedUser = await User.findByPk(user.id, {
      include: [
        {
          model: Role,
          as: 'roles',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ],
      attributes: { exclude: ['password'] }
    });

    res.status(200).send({
      message: 'User roles updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get users by department
exports.getUsersByDepartment = async (req, res) => {
  try {
    const departmentId = req.params.departmentId;
    
    // Validate department ID
    const department = await Department.findByPk(departmentId);
    if (!department) {
      return res.status(404).send({ message: 'Department not found' });
    }
    
    // Find users by department
    const users = await User.findAll({
      where: { departmentId: departmentId },
      include: [
        {
          model: Role,
          as: 'roles',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ],
      attributes: { exclude: ['password'] }
    });
    
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get users by year
exports.getUsersByYear = async (req, res) => {
  try {
    const year = req.params.year;
    
    // Validate year
    if (isNaN(year) || year < 1 || year > 6) {
      return res.status(400).send({ message: 'Invalid year. Year must be between 1 and 6.' });
    }
    
    // Find users by year
    const users = await User.findAll({
      where: { year: year },
      include: [
        {
          model: Role,
          as: 'roles',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ],
      attributes: { exclude: ['password'] }
    });
    
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};