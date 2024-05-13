"use strict";
const {DataTypes} = require("sequelize");

module.exports = {
up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Limit_Setup", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(100),
      },
      functionName: {
        type: DataTypes.STRING(255), // Adjust the length according to your needs
        allowNull: false,
      },
      minPerDayCount: {
        type: DataTypes.STRING(255), // Adjust the length according to your needs
        allowNull: false,
      },
      minPerWeekCount: {
        type: DataTypes.STRING(255), // Adjust the length according to your needs
        allowNull: false,
      },
      minPerMonthCount: {
        type: DataTypes.STRING(255), // Adjust the length according to your needs
        allowNull: false,
      },
      // created_at: {
      //   allowNull: false,
      //   type: Sequelize.DATE,
      //   defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      // },
      // updated_at: {
      //   allowNull: false,
      //   type: Sequelize.DATE,
      //   defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      // },
    });
},

down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Limit_Setup");
},
};
