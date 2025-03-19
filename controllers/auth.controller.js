const db = require('../models');
const config = require('../config/auth.config');
const User = db.user;
const Role = db.role;
const Department = db.department;

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// User registration
exports.signup = async (req, res) => {
  try {
    // Validate request
    if (!req.body.username || !req.body.password || !req.body.email || !req.body.fullName) {
      return res.status(400).send({ message: 'Required fields missing' });
    }

    // Check department if provided
    let department = null;
    if (req.body.departmentId) {
      department = await Department.findByPk(req.body.departmentId);
      if (!department) {
        return res.status(404).send({ message: 'Department not found' });
      }
    }

    // Create user
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      fullName: req.body.fullName,
      year: req.body.year,
      sinNumber: req.body.sinNumber,
      departmentId: department ? department.id : null
    });

    // Assign roles
    // Convert single role ID to array if needed
    if (req.body.roles && typeof req.body.roles === 'number') {
      req.body.roles = [req.body.roles];
    }
    
    if (req.body.roles && req.body.roles.length > 0) {
      const roles = await Role.findAll({
        where: {
          id: {
            [db.Sequelize.Op.in]: req.body.roles
          }
        }
      });

      if (roles.length > 0) {
        await user.setRoles(roles);
        // Set the first role as the primary role
        await user.update({ roleId: roles[0].id });
        res.status(201).send({ message: 'User registered successfully with specified roles' });
      } else {
        // Default role is 'student' (ID: 1)
        const defaultRole = await Role.findOne({ where: { id: 1 } });
        await user.setRoles([defaultRole]);
        // Set the default role as the primary role
        await user.update({ roleId: defaultRole.id });
        res.status(201).send({ message: 'User registered successfully with default role' });
      }
    } else {
      // Default role is 'student' (ID: 1)
      const defaultRole = await Role.findOne({ where: { id: 1 } });
      await user.setRoles([defaultRole]);
      // Set the default role as the primary role
      await user.update({ roleId: defaultRole.id });
      res.status(201).send({ message: 'User registered successfully with default role' });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// User login
exports.signin = async (req, res) => {
  try {
    // Check if input is username or email
    const isEmail = req.body.username && req.body.username.includes('@');
    
    // Find user by username or email
    const user = await User.findOne({
      where: isEmail ? { email: req.body.username } : { username: req.body.username }
    });

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Check if user is active
    if (!user.active) {
      return res.status(403).send({ message: 'Account is inactive' });
    }

    // Verify password
    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: config.jwtExpiration
    });

    // Get user roles - first check the primary role from roleId
    let authorities = [];
    if (user.roleId) {
      const primaryRole = await Role.findByPk(user.roleId);
      if (primaryRole) {
        authorities.push(`ROLE_${primaryRole.name.toUpperCase()}`);
      }
    }
    
    // If no primary role found, fall back to the many-to-many relationship
    if (authorities.length === 0) {
      const roles = await user.getRoles();
      authorities = roles.map(role => `ROLE_${role.name.toUpperCase()}`);
    }

    // Get user department
    const department = await user.getDepartment();

    // Send response with user info and token
    res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      year: user.year,
      sinNumber: user.sinNumber,
      roles: authorities,
      department: department ? { id: department.id, name: department.name } : null,
      accessToken: token
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};