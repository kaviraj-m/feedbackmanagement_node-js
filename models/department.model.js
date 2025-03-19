module.exports = (sequelize, Sequelize) => {
  const Department = sequelize.define("department", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    roleId: {
      type: Sequelize.INTEGER,
      allowNull: true
    }
  });

  return Department;
};