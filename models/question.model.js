module.exports = (sequelize, Sequelize) => {
  const Question = sequelize.define("question", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    text: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    year: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    role: {
      type: Sequelize.ENUM('student', 'staff', 'both'),
      allowNull: false,
      defaultValue: 'both'
    },
    createdBy: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  });

  return Question;
};