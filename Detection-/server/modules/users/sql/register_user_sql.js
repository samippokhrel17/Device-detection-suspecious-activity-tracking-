"use strict";
const  dbHelper = require("./../../../helper/mysql");
const httpStatus = require("http-status");
const {v4} = require("uuid");
const bcrypt = require("bcrypt");

(() => {
module.exports = async (call, callback) => {
    try {
        let response = {status: httpStatus.BAD_REQUEST, message: "Data Not found"};

    let deviceIdentifier = v4();
        let insertObj = {
            uuid: v4(),
            first_name: call.firstName,
            last_name: call.lastName,
            email: call.email,
            mobile_number: call.mobileNumber,
            password: await bcrypt.hash(call.password, 10),
            is_active: 1,
            is_delete: 0,
            login_date: new Date().getTime(),
            created_date: new Date().getTime(),
            customer_pin:await bcrypt.hash(call.customerPin, 10),
            device_identifier:deviceIdentifier
        };

        let query = await dbHelper.format(`INSERT INTO Detection.User SET ?`, [
            insertObj,
        ]);
        const [result] = await dbHelper.query(query);

        if (result && result.warningStatus > 0) {
            return (response = {status: httpStatus.BAD_REQUEST, message: "Duplicate Data entry!"});
        }

        if (result && result.affectedRows > 0) {
          
            return (response = {status: httpStatus.OK, message: "Registered successfully!",deviceIdentifier:deviceIdentifier});
        }
    } catch (error) {
        console.error(error);
        return callback(error)
    }
};
})();
