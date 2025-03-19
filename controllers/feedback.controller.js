const db = require('../models');
const Feedback = db.feedback;
const Question = db.question;
const User = db.user;
const Department = db.department;

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    // Validate request
    if (!req.body.questionId || !req.body.rating) {
      return res.status(400).send({ message: 'Required fields missing' });
    }

    // Check if question exists
    const question = await Question.findByPk(req.body.questionId);
    if (!question) {
      return res.status(404).send({ message: 'Question not found' });
    }

    // Check if question is active
    if (!question.active) {
      return res.status(400).send({ message: 'This question is no longer active' });
    }

    // Get user information
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Check if user's department and year match the question's requirements
    if (question.departmentId !== user.departmentId) {
      return res.status(403).send({ message: 'You cannot submit feedback for a different department' });
    }

    if (question.year !== user.year) {
      return res.status(403).send({ message: 'You cannot submit feedback for a different year' });
    }
    
    // Get user roles
    const roles = await user.getRoles();
    const userRoleNames = roles.map(role => role.name);
    
    // Check if user's role matches the question's role requirement
    if (question.role === 'student' && !userRoleNames.includes('student')) {
      return res.status(403).send({ message: 'This question is only for students' });
    }
    
    if (question.role === 'staff' && !userRoleNames.includes('staff')) {
      return res.status(403).send({ message: 'This question is only for staff' });
    }

    // Check if user has already submitted feedback for this question
    const existingFeedback = await Feedback.findOne({
      where: {
        userId: req.userId,
        questionId: req.body.questionId
      }
    });

    if (existingFeedback) {
      // Update existing feedback
      await existingFeedback.update({
        rating: req.body.rating,
        notes: req.body.notes || existingFeedback.notes,
        submittedAt: new Date()
      });

      return res.status(200).send({
        message: 'Feedback updated successfully',
        feedback: existingFeedback
      });
    }

    // Create new feedback
    const feedback = await Feedback.create({
      rating: req.body.rating,
      notes: req.body.notes,
      userId: req.userId,
      questionId: req.body.questionId
    });

    res.status(201).send({
      message: 'Feedback submitted successfully',
      feedback: feedback
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get feedback by user
exports.getFeedbackByUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.userId;

    // Check if the requesting user has permission to view this user's feedback
    if (req.userId !== userId && !req.userRoles.includes('ROLE_ACADEMIC_DIRECTOR') && !req.userRoles.includes('ROLE_EXECUTIVE_DIRECTOR')) {
      return res.status(403).send({ message: 'Unauthorized to view this feedback' });
    }

    const feedback = await Feedback.findAll({
      where: { userId: userId },
      include: [{
        model: Question,
        as: 'question',
        attributes: ['id', 'text', 'year'],
        include: [{
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }]
      }]
    });

    res.status(200).send(feedback);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get feedback by question
exports.getFeedbackByQuestion = async (req, res) => {
  try {
    const questionId = req.params.questionId;

    // Check if user has permission to view feedback (academic director or executive director)
    if (!req.userRoles.includes('ROLE_ACADEMIC_DIRECTOR') && !req.userRoles.includes('ROLE_EXECUTIVE_DIRECTOR')) {
      return res.status(403).send({ message: 'Unauthorized to view feedback statistics' });
    }

    const feedback = await Feedback.findAll({
      where: { questionId: questionId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'fullName', 'year', 'departmentId'],
        include: [{
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }]
      }]
    });

    // Calculate statistics
    const totalResponses = feedback.length;
    let totalRating = 0;
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    feedback.forEach(item => {
      totalRating += item.rating;
      ratingDistribution[item.rating]++;
    });

    const averageRating = totalResponses > 0 ? (totalRating / totalResponses).toFixed(2) : 0;

    res.status(200).send({
      questionId: questionId,
      totalResponses: totalResponses,
      averageRating: averageRating,
      ratingDistribution: ratingDistribution,
      feedback: feedback
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get feedback statistics by department
exports.getFeedbackStatsByDepartment = async (req, res) => {
  try {
    const departmentId = req.params.departmentId;

    // Check if user has permission to view feedback (academic director or executive director)
    if (!req.userRoles.includes('ROLE_ACADEMIC_DIRECTOR') && !req.userRoles.includes('ROLE_EXECUTIVE_DIRECTOR')) {
      return res.status(403).send({ message: 'Unauthorized to view feedback statistics' });
    }

    // Get all questions for the department
    const questions = await Question.findAll({
      where: { departmentId: departmentId },
      include: [{
        model: Feedback,
        as: 'feedbacks'
      }]
    });

    // Calculate statistics
    let totalResponses = 0;
    let totalRating = 0;
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const questionStats = [];

    questions.forEach(question => {
      const questionResponses = question.feedbacks.length;
      let questionTotalRating = 0;
      
      question.feedbacks.forEach(feedback => {
        totalRating += feedback.rating;
        questionTotalRating += feedback.rating;
        ratingDistribution[feedback.rating]++;
      });

      totalResponses += questionResponses;
      
      questionStats.push({
        questionId: question.id,
        questionText: question.text,
        responses: questionResponses,
        averageRating: questionResponses > 0 ? (questionTotalRating / questionResponses).toFixed(2) : 0
      });
    });

    const averageRating = totalResponses > 0 ? (totalRating / totalResponses).toFixed(2) : 0;

    res.status(200).send({
      departmentId: departmentId,
      totalResponses: totalResponses,
      averageRating: averageRating,
      ratingDistribution: ratingDistribution,
      questionStats: questionStats
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get all feedback in descending order
exports.getAllFeedbackDescending = async (req, res) => {
  try {
    // Check if user has permission to view feedback (academic director or executive director)
    if (!req.userRoles.includes('ROLE_ACADEMIC_DIRECTOR') && !req.userRoles.includes('ROLE_EXECUTIVE_DIRECTOR')) {
      return res.status(403).send({ message: 'Unauthorized to view all feedback' });
    }

    const feedback = await Feedback.findAll({
      order: [['submittedAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'year', 'departmentId'],
          include: [{
            model: Department,
            as: 'department',
            attributes: ['id', 'name']
          }]
        },
        {
          model: Question,
          as: 'question',
          attributes: ['id', 'text', 'year', 'departmentId'],
          include: [{
            model: Department,
            as: 'department',
            attributes: ['id', 'name']
          }]
        }
      ]
    });

    res.status(200).send(feedback);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get overall feedback statistics (for executive director)
exports.getOverallFeedbackStats = async (req, res) => {
  try {
    // Check if user has executive director role
    if (!req.userRoles.includes('ROLE_EXECUTIVE_DIRECTOR')) {
      return res.status(403).send({ message: 'Unauthorized to view overall feedback statistics' });
    }

    // Get all departments
    const departments = await Department.findAll({
      where: { active: true }
    });

    const departmentStats = [];
    let totalResponses = 0;
    let totalRating = 0;
    const overallRatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    // Calculate statistics for each department
    for (const department of departments) {
      // Get all questions for the department
      const questions = await Question.findAll({
        where: { departmentId: department.id },
        include: [{
          model: Feedback,
          as: 'feedbacks'
        }]
      });

      let departmentResponses = 0;
      let departmentTotalRating = 0;
      const departmentRatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      questions.forEach(question => {
        question.feedbacks.forEach(feedback => {
          departmentTotalRating += feedback.rating;
          departmentRatingDistribution[feedback.rating]++;
          overallRatingDistribution[feedback.rating]++;
          departmentResponses++;
        });
      });

      totalResponses += departmentResponses;
      totalRating += departmentTotalRating;

      departmentStats.push({
        departmentId: department.id,
        departmentName: department.name,
        responses: departmentResponses,
        averageRating: departmentResponses > 0 ? (departmentTotalRating / departmentResponses).toFixed(2) : 0,
        ratingDistribution: departmentRatingDistribution
      });
    }

    const overallAverageRating = totalResponses > 0 ? (totalRating / totalResponses).toFixed(2) : 0;

    res.status(200).send({
      totalResponses: totalResponses,
      overallAverageRating: overallAverageRating,
      overallRatingDistribution: overallRatingDistribution,
      departmentStats: departmentStats
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};