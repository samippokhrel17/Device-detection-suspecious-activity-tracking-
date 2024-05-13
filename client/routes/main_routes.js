const express = require('express');
(() => {
    const controller = require('./../controllers/index')
    const authenticate = require("./../controllers/middleware/userAuth")
    const adminAuthenticate = require("./../controllers/middleware/adminAuth")

    const router = express.Router()

    router.post('/register-user', controller.RegisterUser);
    router.post('/login-user',controller.LoginUser);
    router.post('/forgot-password',authenticate,controller.ForgotPassword);
    router.post('/reset-device',controller.ResetDevice);
    router.get('/get-riskDetails',adminAuthenticate,controller.getRiskDetails);
    router.post('/admin_limitSetup',controller.adminLimitSetup);
    router.post('/admin-login',controller.adminLogin);
    module.exports = router;
    
})();