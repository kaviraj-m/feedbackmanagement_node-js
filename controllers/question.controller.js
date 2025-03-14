const db = require('../models');
const Question = db.question;
const Department = db.department;

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

    // Create question
    const question = await Question.create({
      text: req.body.text,
      year: req.body.year,
      departmentId: req.body.departmentId,
      createdBy: req.userId,
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
    const questions = await Question.findAll({
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

    const questions = await Question.findAll({
      where: {
        departmentId: departmentId,
        year: year,
        active: true
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

    // Update question
    await question.update({
      text: req.body.text || question.text,
      year: req.body.year || question.year,
      departmentId: req.body.departmentId || question.departmentId,
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