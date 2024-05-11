const express = require('express');
(() => {
    const controller = require('./../controllers/index')

    const router = express.Router()

    router.post('/register-user', controller.RegisterUser);
    router.post('/login-user',controller.LoginUser);
    router.post('/forgot-password',controller.ForgotPassword);
    router.post('/reset-device',controller.ResetDevice);
    router.get('/get-riskDetails',controller.getRiskDetails);
    

    module.exports = router;
})();