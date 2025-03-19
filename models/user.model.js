module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    fullName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    year: {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    sinNumber: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    },
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    roleId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'roles',
        key: 'id'
      }
    }
  });

  return User;
};