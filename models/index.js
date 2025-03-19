const dbConfig = require('../config/db.config.js');
const Sequelize = require('sequelize');

// Create Sequelize instance
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

// Initialize db object
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.user = require('./user.model.js')(sequelize, Sequelize);
db.role = require('./role.model.js')(sequelize, Sequelize);
db.department = require('./department.model.js')(sequelize, Sequelize);
db.question = require('./question.model.js')(sequelize, Sequelize);
db.feedback = require('./feedback.model.js')(sequelize, Sequelize);

// Define relationships

// User-Role relationship (Many-to-Many)
db.role.belongsToMany(db.user, {
  through: 'user_roles',
  foreignKey: 'roleId',
  otherKey: 'userId'
});

db.user.belongsToMany(db.role, {
  through: 'user_roles',
  foreignKey: 'userId',
  otherKey: 'roleId'
});

// User-Primary Role relationship (One-to-One)
db.role.hasMany(db.user, {
  foreignKey: 'roleId',
  as: 'primaryUsers'
});

db.user.belongsTo(db.role, {
  foreignKey: 'roleId',
  as: 'primaryRole'
});

// User-Department relationship
db.department.hasMany(db.user, { as: 'users' });
db.user.belongsTo(db.department, {
  foreignKey: 'departmentId',
  as: 'department'
});

// Question-Department relationship
db.department.hasMany(db.question, { as: 'questions' });
db.question.belongsTo(db.department, {
  foreignKey: 'departmentId',
  as: 'department'
});

// Department-Role relationship
db.department.belongsTo(db.role, {
  foreignKey: 'roleId',
  as: 'role'
});
db.role.hasMany(db.department, {
  foreignKey: 'roleId',
  as: 'departments'
});

// Feedback relationships
db.user.hasMany(db.feedback, { as: 'feedbacks' });
db.feedback.belongsTo(db.user, {
  foreignKey: 'userId',
  as: 'user'
});

db.question.hasMany(db.feedback, { as: 'feedbacks' });
db.feedback.belongsTo(db.question, {
  foreignKey: 'questionId',
  as: 'question'
});

// Pre-defined roles
db.ROLES = ['student', 'staff', 'academic_director', 'executive_director'];

module.exports = db;