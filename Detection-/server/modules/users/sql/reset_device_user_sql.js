"use strict";
const dbHelper = require("./../../../helper/mysql");
const httpStatus = require("http-status");
const bcrypt = require("bcrypt");
const { v4 } = require("uuid");
const {suspiciousLogMaintainer}=require("./../helpers");
(() => {
module.exports = async (call, callback) => {
    try {
        let response = {status: httpStatus.BAD_REQUEST, message: "Data Not found"};

        let userExistCheck = await dbHelper.format(
            `SELECT uuid, email, password,customer_pin FROM Detection.User WHERE mobile_number = "${call.mobileNumber}"`
        );
        let [userExistCheckResult] = await dbHelper.query(userExistCheck);

        if (!userExistCheckResult || userExistCheckResult.length === 0) {
            return (response = {status: httpStatus.BAD_REQUEST, message: "User Doesn't Exist!"});
        }

        if (userExistCheckResult && userExistCheckResult.length > 0) {
            const match = await bcrypt.compare(call.customerPin, userExistCheckResult[0].customer_pin);

            if (match) {

            let newDeviceIdentifier = v4();
                let updateQuery = await dbHelper.format(
                    `Update Detection.User set device_identifier = "${newDeviceIdentifier}"  WHERE mobile_number = "${call.mobileNumber}" `
                );
                let [executeUpdateQuery] = await dbHelper.query(updateQuery);

                if (executeUpdateQuery && executeUpdateQuery.affectedRows > 0) {
                    let historyObj =
                    {
                        uuid:v4(),
                        mobile_number:call.mobileNumber,
                        created_date:new Date().getTime(),
                        device_identifier:newDeviceIdentifier,
                        update_date:null
                    }
                let resetDeviceLog = await dbHelper.format(`INSERT INTO Detection.reset_device_log SET ?`, [historyObj]);
                    await dbHelper.query(resetDeviceLog);
                    return (response = {status: httpStatus.OK, message: "Reset device success!",deviceIdentifier:newDeviceIdentifier});
                }
            } else {
                let payload=
                {
                    functionName:"INVALID-CUSTOMER-PIN(While reset device)",
                    mobileNumber:call.mobileNumber,
                    positiveMark:0,
                    negativeMark:10 
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
