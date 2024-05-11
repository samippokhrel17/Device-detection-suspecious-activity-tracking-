(() => {
    module.exports = {
        validator: require("./validation_helpers"),
        sendingMail:require("./sending_mail"),
        suspiciousLogMaintainer:require("./suspicious_log_maintainer")
    };
})();
