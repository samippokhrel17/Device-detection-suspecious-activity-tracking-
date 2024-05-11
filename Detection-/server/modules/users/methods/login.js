"use strict";
const httpStatus = require("http-status");
const { jwtHelper} = require("./../../../helper");
const { validator } = require("./../helpers");
const bcrypt = require("bcrypt");
const dbHelper = require("./../../../helper/mysql");
const { v4 } = require("uuid");
const {suspiciousLogMaintainer}=require("./../helpers");
(() => {
module.exports = async (call, callback) => {

    const handleErrorResponse = (callback, status, message) => {
        callback(null, { status, message });
    };

    try {
        let response = { status: httpStatus.BAD_REQUEST, message: "Data Not found" };
        response = await validator.loginCustomer(call.request);
        if (response.status !== httpStatus.OK) {
            return callback(null, response = { status: httpStatus.BAD_REQUEST, message: response.message})
        }
        let deviceIdentifierQuery = await dbHelper.format(`SELECT device_identifier,mobile_number FROM Detection.User WHERE mobile_number = "${call.request.mobileNumber}"`);
     let [deviceIdentifierResult] = await dbHelper.query(deviceIdentifierQuery);

     if (deviceIdentifierResult &&  deviceIdentifierResult.length> 0) {

        if(deviceIdentifierResult[0].device_identifier !==call.request.deviceIdentifier)
            {
                //Device reset request log

                let payload=
                {
                    functionName:"DEVICE-CHANGE-ATTEMPT",
                    mobileNumber:call.request.mobileNumber,
                    positiveMark:0,
                    negativeMark:10 

                }
                await suspiciousLogMaintainer.setLog(payload);
                
                return callback(null,response ={status:httpStatus.BAD_REQUEST,message:"Device has been changed! (Reset device Required)"})
            }

     }

        let validateQuery = await dbHelper.format(`SELECT uuid,password FROM Detection.User WHERE mobile_number = "${call.request.mobileNumber}"`);

        let [userExistCheckResult] = await dbHelper.query(validateQuery);

        if (!userExistCheckResult || userExistCheckResult.length === 0) {
            return callback(null, response = { status: httpStatus.BAD_REQUEST, message: "User doesnt exist!"})

        }



        if (!call.request.otp) {
            let redudancyCheck = await dbHelper.format(`SELECT id, is_otp_verified, mobile_number FROM Detection.user_otp_history WHERE mobile_number = ? AND function_name_otp = "LOGIN-OTP"`, [call.request.mobileNumber]);
            let [redudancyCheckResult] = await dbHelper.query(redudancyCheck);
            if (redudancyCheckResult && redudancyCheckResult.length > 0) {
                for (let item of redudancyCheckResult) {
                    if (item.is_otp_verified === 0 && item.mobile_number === call.request.mobileNumber) {
                        let deleteSuccessOtp = await dbHelper.format(`UPDATE Detection.user_otp_history SET is_delete = 1 WHERE mobile_number = ? AND function_name_otp = "LOGIN-OTP"`, [item.mobile_number]);
                        await dbHelper.query(deleteSuccessOtp);
                
                    }

               
                }
            }

            let otpRequestObj = {
                uuid: v4(),
                mobile_number: call.request.mobileNumber,
                function_name_otp: "LOGIN-OTP",
                otp: Math.floor(Math.random() * (999999 - 111111) + 111111),
                is_active: 1,
                created_date: new Date().getTime(),
                update_date: null,
                is_otp_verified: 0
            };

            let updateOtpRequest = await dbHelper.format(`INSERT INTO Detection.user_otp_history SET ?`, [otpRequestObj]);
            let [updateResult] = await dbHelper.query(updateOtpRequest);
            if (updateResult && updateResult.affectedRows > 0) {
                let payload=
                {
                    functionName:"OTP-SUCCESSFULLY-TRIGGRED",
                    mobileNumber:call.request.mobileNumber,
                    positiveMark:5,
                    negativeMark:0 

                }
                await suspiciousLogMaintainer.setLog(payload);
                return callback(null, { status: httpStatus.OK, message: "OTP sent successfully!" });
            }
        }
      

        if (call.request.otp) {

            let redudancyCheck = await dbHelper.format(`SELECT otp, is_otp_verified, is_delete FROM Detection.user_otp_history WHERE mobile_number = ? AND function_name_otp = "LOGIN-OTP" AND otp = ?`, [call.request.mobileNumber, call.request.otp]);
            let [redudancyCheckResult] = await dbHelper.query(redudancyCheck);
            if (redudancyCheckResult && redudancyCheckResult.length > 0) {
                if (redudancyCheckResult[0].is_delete === 1) {
                    let payload=
                    {
                        functionName:"INVALID-OTP-ATTEMPT",
                        mobileNumber:call.request.mobileNumber,
                        positiveMark:0,
                        negativeMark:15 
    
                    }
                    await suspiciousLogMaintainer.setLog(payload);

                    return handleErrorResponse(callback, httpStatus.BAD_REQUEST, "OTP expired or incorrect");
                }
            } else {
                let payload=
                {
                    functionName:"INVALID-OTP-ATTEMPT",
                    mobileNumber:call.request.mobileNumber,
                    positiveMark:0,
                    negativeMark:15 

                }
                await suspiciousLogMaintainer.setLog(payload);
                return handleErrorResponse(callback, httpStatus.BAD_REQUEST, "OTP expired or incorrect");
            }

            if (call.request.otp === redudancyCheckResult[0].otp) {
                //otp validated log

                let payload=
                {
                    functionName:"OTP-VALIDATE-SUCCESS",
                    mobileNumber:call.request.mobileNumber,
                    positiveMark:10,
                    negativeMark:0 

                }
                await suspiciousLogMaintainer.setLog(payload);
                let deleteSuccessOtp = await dbHelper.format(`UPDATE Detection.user_otp_history SET is_delete = 1, is_otp_verified = 1 WHERE mobile_number = ? AND function_name_otp = "LOGIN-OTP" AND otp = ?`, [call.request.mobileNumber, call.request.otp]);
                let [deleteSuccessOtpResult] = await dbHelper.query(deleteSuccessOtp);

                if (deleteSuccessOtpResult && deleteSuccessOtpResult.affectedRows > 0) {
                    const match = await bcrypt.compare(call.request.password, userExistCheckResult[0].password);
                    if (match) {

                        const jwtAccessToken = await jwtHelper.generateJWTAccessToken(userExistCheckResult[0].uuid);
                        const jwtRefreshToken = await jwtHelper.generateJWTAccessToken(userExistCheckResult[0].uuid);

        
                        if (jwtAccessToken.success && jwtRefreshToken.success) {


                //login history

                let historyObj =
                {
                    uuid:v4(),
                    mobile_number:call.request.mobileNumber,
                    access_token: JSON.stringify(jwtAccessToken.token),
                    refresh_token:JSON.stringify(jwtRefreshToken.token),
                    login_date:new Date().getTime(),
                    device_identifier:call.request.deviceIdentifier,
                    update_date:null
                }


            let loginLog = await dbHelper.format(`INSERT INTO Detection.customer_login_history SET ?`, [historyObj]);
                await dbHelper.query(loginLog);
           
                          return callback(null, response = { 
                                status: httpStatus.OK,
                                 message:"Login Successfull",
                                 accessToken: JSON.stringify(jwtAccessToken),
                                refreshToken: JSON.stringify(jwtRefreshToken)})
        
                        }
                    } else {
                        let payload=
                        {
                            functionName:"INCORRECT-PASSWORD-ATTEMPT",
                            mobileNumber:call.request.mobileNumber,
                            positiveMark:0,
                            negativeMark:20 
        
                        }
                        await suspiciousLogMaintainer.setLog(payload);
                        return callback(null,response={
                            status: httpStatus.BAD_REQUEST,
                            message: "Invalid password."});
                    }
                }
            }

          
        }
     
    } catch (error) {
        console.error(error);
        return callback(null.response={
            status: httpStatus[500],
            message: "Internal Server Error"
        })
    }
};
})();