"use strict";
const dbHelper = require("./../../../helper/mysql");
const httpStatus = require("http-status");
const bcrypt = require("bcrypt");
const {suspiciousLogMaintainer}=require("./../helpers");
const { v4 } = require("uuid");
(() => {
module.exports = async (call, callback) => {
    try {
        let response = {status: httpStatus.BAD_REQUEST, message: "Data Not found"};

        let userExistCheck = await dbHelper.format(
            `SELECT uuid, email,device_identifier, password,customer_pin FROM Detection.User WHERE mobile_number = "${call.mobileNumber}"`
        );
        let [userExistCheckResult] = await dbHelper.query(userExistCheck);

        if (!userExistCheckResult || userExistCheckResult.length === 0) {
            return (response = {status: httpStatus.BAD_REQUEST, message: "User Doesn't Exist!"});
        }

        if (userExistCheckResult && userExistCheckResult.length > 0) {
            const match = await bcrypt.compare(call.customerPin, userExistCheckResult[0].customer_pin);

            if (match) {
                const oldPasswordCheck = await bcrypt.compare(call.password, userExistCheckResult[0].password);

                if (oldPasswordCheck == true) {
                    return (response = {
                        status: httpStatus.BAD_REQUEST,
                        message: "old password matched! use new password...",
                    });
                }

                let newPassword = await bcrypt.hash(call.password, 10);
                let updateQuery = await dbHelper.format(
                    `Update Detection.User set password = "${newPassword}"  WHERE mobile_number = "${call.mobileNumber}" `
                );
                let [executeUpdateQuery] = await dbHelper.query(updateQuery);

                if (executeUpdateQuery && executeUpdateQuery.affectedRows > 0) {
                    let historyObj =
                    {
                        uuid:v4(),
                        mobile_number:call.mobileNumber,
                        created_date:new Date().getTime(),
                        device_identifier:userExistCheckResult[0].device_identifier,
                        update_date:null
                    }
    
    
                let resetDeviceLog = await dbHelper.format(`INSERT INTO Detection.forgot_password_history_customer SET ?`, [historyObj]);
                    await dbHelper.query(resetDeviceLog);   

                    return (response = {status: httpStatus.OK, message: "Password Reset Success!"});
                }  
            } else {
                let payload=
                {
                    functionName:"INVALID-CUSTOMER-PIN(While forgot password)",
                    mobileNumber:call.request.mobileNumber,
                    positiveMark:0,
                    negativeMark:20 

                }
                await suspiciousLogMaintainer.setLog(payload);
                return (response = {status: httpStatus.BAD_REQUEST, message: "Invalid customer pin!"});
            }
        }
    } catch (error) {
        console.error(error);
        return callback(error)
    }
};
})();
