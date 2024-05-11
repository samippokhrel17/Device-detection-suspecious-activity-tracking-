"use strict";
const {DataTypes} = require("sequelize");

module.exports = {
up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("reset_device_log", {
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
        device_identifier: {
            type: DataTypes.STRING(40),
            allowNull: false,
            
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
    await queryInterface.dropTable("reset_device_log");
},
};
