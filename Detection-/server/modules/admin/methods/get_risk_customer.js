"use strict";

(() => {

  const httpStatus = require("http-status");
  const {getRiskCustomerSql}=require("./../sql");
  const dbHelper  = require("../../../helper/mysql");
  module.exports = async (call, callback) => {
    try {
      let response = {
        status: httpStatus.BAD_REQUEST,
        message: "Data Not found",
      };

      if(!call.request.mobileNumber)
        {
          return callback(null,response ={message:"Empty mobile number!",status:httpStatus.BAD_REQUEST})
        }

        let userExistCheck = await dbHelper.format(
          `SELECT uuid, email,device_identifier, password,customer_pin FROM Detection.User WHERE mobile_number = "${call.request.mobileNumber}"`
      );
      let [userExistCheckResult] = await dbHelper.query(userExistCheck);

      if (!userExistCheckResult || userExistCheckResult.length === 0) {
          return callback(null,(response = {status: httpStatus.BAD_REQUEST, message: "User Doesn't Exist!",data:null}))
      }

      const dbResponse = await getRiskCustomerSql(call.request);
      if (dbResponse.status === httpStatus.OK) {  
        response.status = httpStatus.OK;
        response.message = dbResponse.message;
        response.data = dbResponse.Detection;
        response.riskDetails =dbResponse.riskDetails
      }
      return callback(null, dbResponse);
    } catch (error) {
      return callback(error);
    }
  };
})();
