"use strict";
const {DataTypes} = require("sequelize");

module.exports = {
up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("user_otp_history", {
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
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        otp: {
            type: DataTypes.STRING(20),
            allowNull: true,
            
        },
        is_otp_verified: {
          type: DataTypes.TINYINT,
          allowNull: true,
          
      },
        function_name_otp: {
            type: DataTypes.STRING(60),
            allowNull: true,
            
        }, 
        is_active: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: true,
        },
        is_delete: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: false,
        },
        created_date: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        update_date: {
            type: DataTypes.BIGINT,
        },
    });
},

down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("user_otp_history");
},
};
