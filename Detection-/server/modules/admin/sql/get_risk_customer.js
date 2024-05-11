"use strict";

const httpStatus = require("http-status");
const { mysqlHelper } = require("../../../helper");

(() => {
  const dbHelper  = require("../../../helper/mysql");
  module.exports = async (call, callback) => {
    try {
      let response = {
        status: httpStatus.BAD_REQUEST,
        message: "Data Not found",
      };

      let query = await dbHelper.format(
        `SELECT
        mobile_number,
        CASE
            WHEN (
                SELECT COUNT(DISTINCT device_identifier)
                FROM Detection.customer_login_history
                WHERE mobile_number = c.mobile_number
            ) > 1 THEN 'High Risk (Multiple Device Identifiers)'
            WHEN (
                SELECT COUNT(DISTINCT device_identifier)
                FROM Detection.customer_login_history
                WHERE mobile_number = c.mobile_number
            ) = 1 AND (
                SELECT COUNT(DISTINCT device_identifier)
                FROM Detection.customer_login_history
                WHERE mobile_number = c.mobile_number
            ) = (
                SELECT COUNT(DISTINCT device_identifier)
                FROM Detection.customer_login_history
                WHERE mobile_number = c.mobile_number AND device_identifier <> (
                    SELECT MAX(device_identifier)
                    FROM Detection.customer_login_history
                    WHERE mobile_number = c.mobile_number
                )
            ) THEN 'High Risk (Different Device Identifier)'
            ELSE 'Low Risk'
        END AS device_risk,
        CASE
            WHEN (
                SELECT COUNT(*)
                FROM Detection.forgot_password_history_customer
                WHERE mobile_number = c.mobile_number
            ) > 1 THEN 'High Risk (Multiple Password Reset Attempts)'
            ELSE 'Low Risk'
        END AS password_reset_risk,
        CASE
            WHEN (
                SELECT COUNT(*)
                FROM Detection.reset_device_log
                WHERE mobile_number = c.mobile_number
            ) > 1 THEN 'High Risk (Multiple Device Resets)'
            ELSE 'Low Risk'
        END AS device_reset_risk
    FROM (
        SELECT '${call.mobileNumber}' AS mobile_number
    ) AS c;
    
    `
      );
      const [result] = await dbHelper.query(query);


      if (result && result.length >0) {

        let extraDetailsOfRisk = await mysqlHelper.format(`SELECT
        mobile_number,
        function_name,
        ROUND(SUM(negative_suspicious_mark) / (SELECT SUM(negative_suspicious_mark) FROM Detection_log_customer WHERE mobile_number = '9862383579') * 100, 2) AS risk_percentage
    FROM
        Detection.Detection_log_customer
    WHERE
        mobile_number = '${call.mobileNumber}'
    GROUP BY
        function_name;
    `);
    const [extraDetailsOfRiskResult] = await dbHelper.query(extraDetailsOfRisk);

    if(extraDetailsOfRiskResult && extraDetailsOfRiskResult.length >0)
      {
        (response.status = httpStatus.OK),
        (response.message = " Data fetch succesfully"),
        (response.data = result);
        (response.riskDetails =extraDetailsOfRiskResult)
      }
      
      }
      else{
        (response.status = httpStatus.BAD_REQUEST),
        (response.message = " Data not found"),
        (response.data = null),
        (response.riskDetails=null)
      }
      return response;
    } catch (error) {
      console.error(error);
      throw new Error("Error retrievring Data");
    }
  };
})();
