const db = require('../models');
const User = db.user;
const ROLES = db.ROLES;

// Check for duplicate username or email
checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    // Check username
    let user = await User.findOne({
      where: {
        username: req.body.username
      }
    });

    if (user) {
      return res.status(400).send({
        message: 'Failed! Username is already in use!'
      });
    }

    // Check email
    user = await User.findOne({
      where: {
        email: req.body.email
      }
    });

    if (user) {
      return res.status(400).send({
        message: 'Failed! Email is already in use!'
      });
    }

    // Check SIN number if provided
    if (req.body.sinNumber) {
      user = await User.findOne({
        where: {
          sinNumber: req.body.sinNumber
        }
      });

      if (user) {
        return res.status(400).send({
          message: 'Failed! SIN number is already in use!'
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).send({
      message: error.message
    });
  }
};

// Check if roles exist
checkRolesExisted = async (req, res, next) => {
  try {
    if (req.body.roles) {
      // Convert single role ID to array if needed
      const roles = Array.isArray(req.body.roles) ? req.body.roles : [req.body.roles];
      
      // Get all role IDs from the database
      const allRoles = await db.role.findAll();
      const validRoleIds = allRoles.map(role => role.id);
      
      for (let i = 0; i < roles.length; i++) {
        if (!validRoleIds.includes(Number(roles[i]))) {
          return res.status(400).send({
            message: `Failed! Role ID ${roles[i]} does not exist!`
          });
        }
      }
    }

    next();
  } catch (error) {
    res.status(500).send({
      message: error.message
    });
  }
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted
};

module.exports = verifySignUp;