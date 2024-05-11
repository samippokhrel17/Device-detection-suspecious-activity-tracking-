"use strict";

module.exports = {
    createUser: require("./register_user_sql"),
    forgotPasswordSql: require("./forgot_password_sql"),
    resetDeviceUser:require("./reset_device_user_sql")

}