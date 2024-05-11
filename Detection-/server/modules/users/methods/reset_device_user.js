"use strict";
const httpStatus = require("http-status");
const {resetDeviceUser} = require("../sql");
const {validator} = require("./../helpers");

(() => {
module.exports = async (call, callback) => {
    try {
        let response = {status: httpStatus.BAD_REQUEST, message: "Data Not found"};

        response = await validator.resetDeviceValidation(call.request);
        if (response.status !== httpStatus.OK) {
          return callback(null, response = { status: httpStatus.BAD_REQUEST, message: response.message  })

           
        }

        let result = await resetDeviceUser(call.request);

        if (result && result.status == httpStatus.OK) {
          return callback(null, response = { status: httpStatus.OK, message: result.message,deviceIdentifier:result.deviceIdentifier  })

        }

        if (result && result.status == httpStatus.BAD_REQUEST) {
          return callback(null, response = { status: httpStatus.BAD_REQUEST, message: result.message, deviceIdentifier:null })

          
        }
        return callback(null, response = { status: httpStatus.BAD_REQUEST, message: response.message ,deviceIdentifier:null })

       
    } catch (error) {
        console.error(error);
        return callback(error)

    }
};
})();
