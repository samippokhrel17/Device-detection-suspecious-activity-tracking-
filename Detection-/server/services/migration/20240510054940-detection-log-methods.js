"use strict";
const {DataTypes} = require("sequelize");

module.exports = {
up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Detection_log_customer", {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER(100),
        },
        uuid: {
            type: DataTypes.STRING(36),
            allowNull: false,
            unique: true,
        },
        mobile_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        function_name: {
            type: DataTypes.STRING(40),
            allowNull: false,
            
        },
        postive_suspicious_mark: {
            type: DataTypes.STRING(100),
            allowNull: false,
            
        },
        negative_suspicious_mark: {
          type: DataTypes.STRING(100),
          allowNull: false,
          
      },
        ultimate_value: {
            type: DataTypes.STRING(20),
            allowNull: false,
            
        },

        is_daily: {
            type: DataTypes.TINYINT,
            allowNull: true,
            
        },
        is_weekly: {
            type: DataTypes.TINYINT,
            allowNull: true,
            
        },
        is_monthly: {
            type: DataTypes.TINYINT,
            allowNull: true,
            
        },
        created_date: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
 
        update_date: {
            type: DataTypes.BIGINT,
            allowNull:true
        },
    });
},

down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Detection_log_customer");
},
};
