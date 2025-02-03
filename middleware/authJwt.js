const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const db = require('../models');
const User = db.user;

// Verify JWT token
verifyToken = (req, res, next) => {
  let token = req.headers['x-access-token'];

  if (!token) {
    return res.status(403).send({
      message: 'No token provided!'
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: 'Unauthorized!'
      });
    }
    req.userId = decoded.id;
    next();
  });
};

// Check if user has student role
isStudent = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === 'student') {
        req.userRoles = roles.map(role => `ROLE_${role.name.toUpperCase()}`);
        return next();
      }
    }

    return res.status(403).send({
      message: 'Require Student Role!'
    });
  } catch (error) {
    return res.status(500).send({
      message: 'Unable to validate Student role!'
    });
  }
};

// Check if user has staff role
isStaff = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === 'staff') {
        req.userRoles = roles.map(role => `ROLE_${role.name.toUpperCase()}`);
        return next();
      }
    }

    return res.status(403).send({
      message: 'Require Staff Role!'
    });
  } catch (error) {
    return res.status(500).send({
      message: 'Unable to validate Staff role!'
    });
  }
};

// Check if user has academic director role
isAcademicDirector = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === 'academic_director') {
        req.userRoles = roles.map(role => `ROLE_${role.name.toUpperCase()}`);
        return next();
      }
    }

    return res.status(403).send({
      message: 'Require Academic Director Role!'
    });
  } catch (error) {
    return res.status(500).send({
      message: 'Unable to validate Academic Director role!'
    });
  }
};

// Check if user has executive director role
isExecutiveDirector = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === 'executive_director') {
        req.userRoles = roles.map(role => `ROLE_${role.name.toUpperCase()}`);
        return next();
      }
    }

    return res.status(403).send({
      message: 'Require Executive Director Role!'
    });
  } catch (error) {
    return res.status(500).send({
      message: 'Unable to validate Executive Director role!'
    });
  }
};

// Check if user has academic director or executive director role
isAcademicDirectorOrExecutiveDirector = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();
    
    req.userRoles = roles.map(role => `ROLE_${role.name.toUpperCase()}`);

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === 'academic_director' || roles[i].name === 'executive_director') {
        return next();
      }
    }

    return res.status(403).send({
      message: 'Require Academic Director or Executive Director Role!'
    });
  } catch (error) {
    return res.status(500).send({
      message: 'Unable to validate roles!'
    });
  }
};

// Check if user has student or staff role
isStudentOrStaff = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const roles = await user.getRoles();
    
    req.userRoles = roles.map(role => `ROLE_${role.name.toUpperCase()}`);

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === 'student' || roles[i].name === 'staff') {
        return next();
      }
    }

    return res.status(403).send({
      message: 'Require Student or Staff Role!'
    });
  } catch (error) {
    return res.status(500).send({
      message: 'Unable to validate roles!'
    });
  }
};

const authJwt = {
  verifyToken,
  isStudent,
  isStaff,
  isAcademicDirector,
  isExecutiveDirector,
  isAcademicDirectorOrExecutiveDirector,
  isStudentOrStaff
};

module.exports = authJwt;