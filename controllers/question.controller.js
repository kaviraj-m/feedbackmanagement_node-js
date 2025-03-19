const db = require('../models');
const Question = db.question;
const Department = db.department;
const User = db.user;
const Role = db.role;

// Create a new question
exports.createQuestion = async (req, res) => {
  try {
    // Validate request
    if (!req.body.text || !req.body.year || !req.body.departmentId) {
      return res.status(400).send({ message: 'Required fields missing' });
    }

    // Check if department exists
    const department = await Department.findByPk(req.body.departmentId);
    if (!department) {
      return res.status(404).send({ message: 'Department not found' });
    }
    
    // Validate role if provided
    let role = 'both'; // Default role
    if (req.body.role) {
      if (!['student', 'staff', 'both'].includes(req.body.role)) {
        return res.status(400).send({ message: 'Invalid role. Must be student, staff, or both' });
      }
      role = req.body.role;
    }

    // Create question
    const question = await Question.create({
      text: req.body.text,
      year: req.body.year,
      departmentId: req.body.departmentId,
      createdBy: req.userId,
      role: role,
      active: true
    });

    res.status(201).send(question);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get all questions
exports.getAllQuestions = async (req, res) => {
  try {
    // Get user to determine their role
    const user = await User.findByPk(req.userId, {
      include: [{
        model: Role,
        as: 'primaryRole',
        attributes: ['id', 'name']
      }]
    });
    
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    
    // Determine which questions to show based on user's primary role
    let roleCondition = {};
    
    // If user has a primary role
    if (user.primaryRole) {
      // Check if user has student role
      if (user.primaryRole.name === 'student') {
        roleCondition = {
          [db.Sequelize.Op.or]: [
            { role: 'student' },
            { role: 'both' }
          ]
        };
      } 
      // Check if user has staff role
      else if (user.primaryRole.name === 'staff') {
        roleCondition = {
          [db.Sequelize.Op.or]: [
            { role: 'staff' },
            { role: 'both' }
          ]
        };
      }
      // For academic directors and executive directors, show all questions
      // by not applying any role filter
    }
    
    const questions = await Question.findAll({
      where: {
        active: true,
        ...roleCondition
      },
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }]
    });

    res.status(200).send(questions);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get questions by department and year
exports.getQuestionsByDepartmentAndYear = async (req, res) => {
  try {
    const departmentId = req.params.departmentId;
    const year = req.params.year;
    
    // Get user to determine their role
    const user = await User.findByPk(req.userId, {
      include: [{
        model: Role,
        as: 'primaryRole',
        attributes: ['id', 'name']
      }]
    });
    
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    
    // Determine which questions to show based on user's primary role
    let roleCondition = {};
    
    // If user has a primary role
    if (user.primaryRole) {
      // Check if user has student role (ID 1)
      if (user.primaryRole.name === 'student') {
        roleCondition = {
          [db.Sequelize.Op.or]: [
            { role: 'student' },
            { role: 'both' }
          ]
        };
      } 
      // Check if user has staff role (ID 3)
      else if (user.primaryRole.name === 'staff') {
        roleCondition = {
          [db.Sequelize.Op.or]: [
            { role: 'staff' },
            { role: 'both' }
          ]
        };
      }
      // For academic directors and executive directors, show all questions
      // by not applying any role filter
    }
    
    const questions = await Question.findAll({
      where: {
        departmentId: departmentId,
        year: year,
        active: true,
        ...roleCondition
      },
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }]
    });

    res.status(200).send(questions);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Update a question
exports.updateQuestion = async (req, res) => {
  try {
    const id = req.params.id;
    const question = await Question.findByPk(id);

    if (!question) {
      return res.status(404).send({ message: 'Question not found' });
    }

    // Validate role if provided
    if (req.body.role && !['student', 'staff', 'both'].includes(req.body.role)) {
      return res.status(400).send({ message: 'Invalid role. Must be student, staff, or both' });
    }

    // Update question
    await question.update({
      text: req.body.text || question.text,
      year: req.body.year || question.year,
      departmentId: req.body.departmentId || question.departmentId,
      role: req.body.role || question.role,
      active: req.body.active !== undefined ? req.body.active : question.active
    });

    res.status(200).send({
      message: 'Question updated successfully',
      question: question
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Delete a question
exports.deleteQuestion = async (req, res) => {
  try {
    const id = req.params.id;
    const question = await Question.findByPk(id);

    if (!question) {
      return res.status(404).send({ message: 'Question not found' });
    }

    await question.destroy();
    res.status(200).send({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get questions created by a specific user
exports.getQuestionsByCreator = async (req, res) => {
  try {
    const creatorId = req.params.creatorId;

    const questions = await Question.findAll({
      where: { createdBy: creatorId },
      include: [{
        model: Department,
        as: 'department',
        attributes: ['id', 'name']
      }]
    });

    res.status(200).send(questions);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};