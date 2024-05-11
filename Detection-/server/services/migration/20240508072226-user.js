"use strict";
const {DataTypes} = require("sequelize");

module.exports = {
up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("User", {
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
        first_name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: true,
            
        },
        mobile_number: {
            type: DataTypes.STRING(20),
            allowNull: true,
            
        },
        customer_pin: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
            
        password: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        is_active: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: true,
        },
        device_identifier: {
            type: DataTypes.STRING(40),
            allowNull: false,
            
        },
        is_delete: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: false,
        },
        login_date: {
            type: DataTypes.BIGINT,
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
    await queryInterface.dropTable("User");
},
};
