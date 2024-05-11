"use strict";

const httpStatus = require("http-status");
const { createUser } = require("../sql");
const { validator } = require("./../helpers");
const dbHelper = require("./../../../helper/mysql");
const { v4 } = require("uuid");

const handleErrorResponse = (callback, status, message) => {
    callback(null, { status, message });
};

(() => {
    module.exports = async (call, callback) => {
        try {
            let response = { status: httpStatus.BAD_REQUEST, message: "Data Not found" };
            response = await validator.createUpdateValidator(call.request);
            if (response.status !== httpStatus.OK) {
                return handleErrorResponse(callback, httpStatus.BAD_REQUEST, response.message);
            }

            let validateQuery = await dbHelper.format(`SELECT uuid FROM Detection.User WHERE mobile_number = "${call.request.mobileNumber}"`);
            let [validateResult] = await dbHelper.query(validateQuery);
            if (validateResult && validateResult.length > 0) {
                return handleErrorResponse(callback, httpStatus.BAD_REQUEST, "Redundant mobile number!(Customer Already Registered)");
            }

            let emailValidate = await dbHelper.format(`SELECT uuid FROM Detection.User WHERE email = "${call.request.email}"`);
            let [emailValidateResult] = await dbHelper.query(emailValidate);
            if (emailValidateResult && emailValidateResult.length > 0) {
                return handleErrorResponse(callback, httpStatus.BAD_REQUEST, "Redundant Email Address(Customer Already Registered)");
            }

            if (!call.request.otp) {
                let redudancyCheck = await dbHelper.format(`SELECT id, is_otp_verified, mobile_number FROM Detection.user_otp_history WHERE mobile_number = ? AND function_name_otp = "REGISTER-OTP"`, [call.request.mobileNumber]);
                let [redudancyCheckResult] = await dbHelper.query(redudancyCheck);
                if (redudancyCheckResult && redudancyCheckResult.length > 0) {
                    for (let item of redudancyCheckResult) {
                        if (item.is_otp_verified === 0 && item.mobile_number === call.request.mobileNumber) {
                            let deleteSuccessOtp = await dbHelper.format(`UPDATE Detection.user_otp_history SET is_delete = 1 WHERE mobile_number = ? AND function_name_otp = "REGISTER-OTP"`, [item.mobile_number]);
                            await dbHelper.query(deleteSuccessOtp);
                        }
                    }
                }

                let otpRequestObj = {
                    uuid: v4(),
                    mobile_number: call.request.mobileNumber,
                    function_name_otp: "REGISTER-OTP",
                    otp: Math.floor(Math.random() * (999999 - 111111) + 111111),
                    is_active: 1,
                    created_date: new Date().getTime(),
                    update_date: null,
                    is_otp_verified: 0
                };

                let updateOtpRequest = await dbHelper.format(`INSERT INTO Detection.user_otp_history SET ?`, [otpRequestObj]);
                let [updateResult] = await dbHelper.query(updateOtpRequest);
                if (updateResult && updateResult.affectedRows > 0) {
                    return callback(null, { status: httpStatus.OK, message: "OTP sent successfully!" });
                }
            }

            if (call.request.otp) {
                let redudancyCheck = await dbHelper.format(`SELECT otp, is_otp_verified, is_delete FROM Detection.user_otp_history WHERE mobile_number = ? AND function_name_otp = "REGISTER-OTP" AND otp = ?`, [call.request.mobileNumber, call.request.otp]);
                let [redudancyCheckResult] = await dbHelper.query(redudancyCheck);
                if (redudancyCheckResult && redudancyCheckResult.length > 0) {
                    if (redudancyCheckResult[0].is_delete === 1) {
                        return handleErrorResponse(callback, httpStatus.BAD_REQUEST, "OTP expired or incorrect");
                    }
                } else {
                    return handleErrorResponse(callback, httpStatus.BAD_REQUEST, "OTP expired or incorrect");
                }

                if (call.request.otp === redudancyCheckResult[0].otp) {
                    let deleteSuccessOtp = await dbHelper.format(`UPDATE Detection.user_otp_history SET is_delete = 1, is_otp_verified = 1 WHERE mobile_number = ? AND function_name_otp = "REGISTER-OTP" AND otp = ?`, [call.request.mobileNumber, call.request.otp]);
                    let [deleteSuccessOtpResult] = await dbHelper.query(deleteSuccessOtp);

                    if (deleteSuccessOtpResult && deleteSuccessOtpResult.affectedRows > 0) {
                        response = await createUser(call.request);
                        if (response && response.status === httpStatus.OK) {
                            return callback(null, { message: "Successfully registered", status: httpStatus.OK ,deviceIdentifier:response.deviceIdentifier});
                        }
                    }
                } else {
                    return handleErrorResponse(callback, httpStatus.BAD_REQUEST, "Invalid OTP entered");
                }
            }
            return handleErrorResponse(callback, httpStatus.BAD_REQUEST, "Data Not Found");
        } catch (error) {
            console.error(error);
            return handleErrorResponse(callback, httpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error");
        }
    };
})();
