"use strict";
(() => {
    const { mysqlHelper } = require("../../../helper");
//   const { dbHelper } = require("../");
  module.exports = async (call, callback) => {
    let connection;
    try {
      let response = { status: false, message: "Create Failed" };
      let insert = {
        functionName: call.functionName,
        minPerDayCount: call.minPerDayCount,
        minPerWeekCount: call.minPerWeekCount,
        minPerMonthCount: call.minPerMonthCount,
      };
      const [rows] = await mysqlHelper.query(
        `insert into Limit_Setup set ? `,
        insert
      );
      if (rows.insertId > 0) {
        response.status = true;
        response.message = "Created Successfully";
      }
      return response;
    } catch (error) {
      throw error;
    } finally {
      if (connection) mysqlHelper.releaseConnection(connection);
    }
  };
})();
