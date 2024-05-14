"use strict";
const httpStatus = require("http-status");
const { jwtHelper, mysqlHelper} = require("./../../../helper");
const { validator } = require("./../helpers");
const bcrypt = require("bcrypt");
const dbHelper = require("./../../../helper/mysql");
const { v4 } = require("uuid");  //?????
const {suspiciousLogMaintainer}=require("./../helpers"); //????
(() => {
module.exports = async (call, callback) => {

    const handleErrorResponse = (callback, status, message) => {
        callback(null, { status, message });
    };

    try {
        let response = { status: httpStatus.BAD_REQUEST, message: "Data Not found" };
        response = await validator.loginCustomer(call.request); // Validating login data
        if (response.status !== httpStatus.OK) {
            return callback(null, response = { status: httpStatus.BAD_REQUEST, message: response.message})
        }

          // Checking device identifier
        let deviceIdentifierQuery = await dbHelper.format(`SELECT device_identifier,mobile_number FROM Detection.User WHERE mobile_number = "${call.request.mobileNumber}"`);
     let [deviceIdentifierResult] = await dbHelper.query(deviceIdentifierQuery);

     if (deviceIdentifierResult &&  deviceIdentifierResult.length> 0) {

        if(deviceIdentifierResult[0].device_identifier !==call.request.deviceIdentifier)
            {
                // Query to fetch limit setup for device reset
                let query = await mysqlHelper.format(`select functionName, minPerDayCount, minPerWeekCount, minPerMonthCount
                        from Detection.Limit_Setup where functionName ="RESET-DEVICE"`);
                        let [queryResult] = await mysqlHelper.query(query);
                        if(queryResult && queryResult.length >0)
                            {
                                  // Checking count of incorrect password attempts
                                let checkQuery = await mysqlHelper.format(`select count(*) as count from Detection_log_customer where function_name ="INCORRECT-PASSWORD-ATTEMPT" and mobile_number = "${call.request.mobileNumber}"`);
                                let [checkResult]= await mysqlHelper.query(checkQuery);

                                if(checkResult && checkResult.length >0) // If check result exists
                                    {
                             if(checkResult[0].count > queryResult[0].minPerDayCount) // If count exceeds daily limit
                                {
                                    let updateDaily = await mysqlHelper.format(`update Detection.Detection_log_customer set is_daily = 1 where function_name = "DEVICE-CHANGE-ATTEMPT" and mobile_number = "${call.request.mobileNumber}"`);
                                   await mysqlHelper.query(updateDaily);

                                }
                                else if(checkResult[0].count > queryResult[0].minPerWeekCount)  // If count exceeds weekly limit
                                    {
                                        let updateDaily = await mysqlHelper.format(`update Detection.Detection_log_customer set is_weekly = 1 where function_name = "DEVICE-CHANGE-ATTEMPT" and mobile_number = "${call.request.mobileNumber}"`);
                                        await mysqlHelper.query(updateDaily);
                                    }
                                    else if(checkResult[0].count > queryResult[0].minPerMonthCount) // If count exceeds monthly limit
                                        {
                                            let updateDaily = await mysqlHelper.format(`update Detection.Detection_log_customer set is_monthly = 1 where function_name = "DEVICE-CHANGE-ATTEMPT" and mobile_number = "${call.request.mobileNumber}"`);
                                            await mysqlHelper.query(updateDaily);
                                        }
                                    }
                            }
  // Logging device change attempt
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
  // Checking if user exists
        let validateQuery = await dbHelper.format(`SELECT uuid,password FROM Detection.User WHERE mobile_number = "${call.request.mobileNumber}"`);

        let [userExistCheckResult] = await dbHelper.query(validateQuery);

        if (!userExistCheckResult || userExistCheckResult.length === 0) {
            return callback(null, response = { status: httpStatus.BAD_REQUEST, message: "User doesnt exist!"})

        }



        if (!call.request.otp) { // If OTP is not provided
             // Checking for redundant OTP requests
            let redudancyCheck = await dbHelper.format(`SELECT id, is_otp_verified, mobile_number FROM Detection.user_otp_history WHERE mobile_number = ? AND function_name_otp = "LOGIN-OTP"`, [call.request.mobileNumber]);
            let [redudancyCheckResult] = await dbHelper.query(redudancyCheck);
            if (redudancyCheckResult && redudancyCheckResult.length > 0) { // If redundancy check result exists
                 // Deleting previous OTPs if not verified
                for (let item of redudancyCheckResult) {
                    if (item.is_otp_verified === 0 && item.mobile_number === call.request.mobileNumber) {
                        let deleteSuccessOtp = await dbHelper.format(`UPDATE Detection.user_otp_history SET is_delete = 1 WHERE mobile_number = ? AND function_name_otp = "LOGIN-OTP"`, [item.mobile_number]);
                        await dbHelper.query(deleteSuccessOtp);
                
                    }

               
                }
            }
  // Generating and sending OTP
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
                  // Logging successful OTP trigger
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
             // Checking OTP validity

            let redudancyCheck = await dbHelper.format(`SELECT otp, is_otp_verified, is_delete FROM Detection.user_otp_history WHERE mobile_number = ? AND function_name_otp = "LOGIN-OTP" AND otp = ?`, [call.request.mobileNumber, call.request.otp]);
            let [redudancyCheckResult] = await dbHelper.query(redudancyCheck);
            if (redudancyCheckResult && redudancyCheckResult.length > 0) {
                if (redudancyCheckResult[0].is_delete === 1) {// If OTP is already used
                    
 // Fetching limit setup for invalid OTP attempts
                    let query = await mysqlHelper.format(`select functionName, minPerDayCount, minPerWeekCount, minPerMonthCount
                    from Detection.Limit_Setup where functionName ="OTP"`);
                    let [queryResult] = await mysqlHelper.query(query);
                    if(queryResult && queryResult.length >0)
                        {
                            // Checking count of invalid OTP attempts
                            let checkQuery = await mysqlHelper.format(`select count(*) as count from Detection_log_customer where function_name ="INVALID-OTP-ATTEMPT" and mobile_number = "${call.request.mobileNumber}"`);
                            let [checkResult]= await mysqlHelper.query(checkQuery);

                            if(checkResult && checkResult.length >0) // If check result exists
                                {
                         if(checkResult[0].count > queryResult[0].minPerDayCount) // If count exceeds daily limit
                            {
                                let updateDaily = await mysqlHelper.format(`update Detection.Detection_log_customer set is_daily = 1 where function_name = "INVALID-OTP-ATTEMPT" and mobile_number = "${call.request.mobileNumber}"`);
                               await mysqlHelper.query(updateDaily);

                            }
                            else if(checkResult[0].count > queryResult[0].minPerWeekCount)  // If count exceeds weekly limit
                                {
                                    let updateDaily = await mysqlHelper.format(`update Detection.Detection_log_customer set is_weekly = 1 where function_name = "INVALID-OTP-ATTEMPT" and mobile_number = "${call.request.mobileNumber}"`);
                                    await mysqlHelper.query(updateDaily);
                                }
                                else if(checkResult[0].count > queryResult[0].minPerMonthCount) // If count exceeds monthly limit
                                    {
                                        let updateDaily = await mysqlHelper.format(`update Detection.Detection_log_customer set is_monthly = 1 where function_name = "INVALID-OTP-ATTEMPT" and mobile_number = "${call.request.mobileNumber}"`);
                                        await mysqlHelper.query(updateDaily);
                                    }
                                }
                        }

  // Logging incorrect password attempt
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

                let query = await mysqlHelper.format(`select functionName, minPerDayCount, minPerWeekCount, minPerMonthCount
                    from Detection.Limit_Setup where functionName ="OTP"`);
                    let [queryResult] = await mysqlHelper.query(query);

                    if(queryResult && queryResult.length >0){

                let checkQuery = await mysqlHelper.format(`select count(*) as count from Detection_log_customer where function_name ="INVALID-OTP-ATTEMPT" and mobile_number = "${call.request.mobileNumber}"`);
                let [checkResult]= await mysqlHelper.query(checkQuery);

                if(checkResult && checkResult.length >0)
                    {
             if(checkResult[0].count > queryResult[0].minPerDayCount)
                {
                    let updateDaily = await mysqlHelper.format(`update Detection.Detection_log_customer set is_daily = 1 where function_name = "INVALID-OTP-ATTEMPT" and mobile_number = "${call.request.mobileNumber}"`);
                   await mysqlHelper.query(updateDaily);

                }
                else if(checkResult[0].count > queryResult[0].minPerWeekCount)
                    {
                        let updateDaily = await mysqlHelper.format(`update Detection.Detection_log_customer set is_weekly = 1 where function_name = "INVALID-OTP-ATTEMPT" and mobile_number = "${call.request.mobileNumber}"`);
                        await mysqlHelper.query(updateDaily);
                    }
                    else if(checkResult[0].count > queryResult[0].minPerMonthCount)
                        {
                            let updateDaily = await mysqlHelper.format(`update Detection.Detection_log_customer set is_monthly = 1 where function_name = "INVALID-OTP-ATTEMPT" and mobile_number = "${call.request.mobileNumber}"`);
                            await mysqlHelper.query(updateDaily);
                        }
                    }
                }

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
               
// Logging successful OTP validation
                let payload=
                {
                    functionName:"OTP-VALIDATE-SUCCESS",
                    mobileNumber:call.request.mobileNumber,
                    positiveMark:10,
                    negativeMark:0 

                }
                await suspiciousLogMaintainer.setLog(payload);
                // Updating OTP status and verifying it
                let deleteSuccessOtp = await dbHelper.format(`UPDATE Detection.user_otp_history SET is_delete = 1, is_otp_verified = 1 WHERE mobile_number = ? AND function_name_otp = "LOGIN-OTP" AND otp = ?`, [call.request.mobileNumber, call.request.otp]);
                let [deleteSuccessOtpResult] = await dbHelper.query(deleteSuccessOtp);

                if (deleteSuccessOtpResult && deleteSuccessOtpResult.affectedRows > 0) {
                     // Checking password validity
                    const match = await bcrypt.compare(call.request.password, userExistCheckResult[0].password);
                    if (match) {

                          // Generating JWT tokens
                        const jwtAccessToken = await jwtHelper.generateJWTAccessToken(userExistCheckResult[0].uuid);
                        const jwtRefreshToken = await jwtHelper.generateJWTAccessToken(userExistCheckResult[0].uuid);

        
                        if (jwtAccessToken.success && jwtRefreshToken.success) { // If token generation is successful


   // Logging login history
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
                        // Fetching limit setup for incorrect password attempts
                        let query = await mysqlHelper.format(`select functionName, minPerDayCount, minPerWeekCount, minPerMonthCount
                        from Detection.Limit_Setup where functionName ="INCORRECT-PASSWORD"`);
                        let [queryResult] = await mysqlHelper.query(query);
                        if(queryResult && queryResult.length >0)
                            {
                                 // Checking count of incorrect password attempts
                                let checkQuery = await mysqlHelper.format(`select count(*) as count from Detection_log_customer where function_name ="INCORRECT-PASSWORD-ATTEMPT" and mobile_number = "${call.request.mobileNumber}"`);
                                let [checkResult]= await mysqlHelper.query(checkQuery);

                                if(checkResult && checkResult.length >0)
                                    {
                             if(checkResult[0].count > queryResult[0].minPerDayCount) // If count exceeds Daily limit
                                {
                                    let updateDaily = await mysqlHelper.format(`update Detection.Detection_log_customer set is_daily = 1 where function_name = "INCORRECT-PASSWORD-ATTEMPT" and mobile_number = "${call.request.mobileNumber}"`);
                                   await mysqlHelper.query(updateDaily);

                                }
                                else if(checkResult[0].count > queryResult[0].minPerWeekCount) // If count exceeds weekly limit
                                    {
                                        let updateDaily = await mysqlHelper.format(`update Detection.Detection_log_customer set is_weekly = 1 where function_name = "INCORRECT-PASSWORD-ATTEMPT" and mobile_number = "${call.request.mobileNumber}"`);
                                        await mysqlHelper.query(updateDaily);
                                    }
                                    else if(checkResult[0].count > queryResult[0].minPerMonthCount) // If count exceeds monthly limit
                                        {
                                            let updateDaily = await mysqlHelper.format(`update Detection.Detection_log_customer set is_monthly = 1 where function_name = "INCORRECT-PASSWORD-ATTEMPT" and mobile_number = "${call.request.mobileNumber}"`);
                                            await mysqlHelper.query(updateDaily);
                                        }
                                    }
                            }
   // Logging incorrect password attempt
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
