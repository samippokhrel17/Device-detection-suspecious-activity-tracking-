const express = require('express');
(() => {
    const controller = require('./../controllers/index')

    const router = express.Router()

    router.post('/register-user', controller.RegisterUser);
    module.exports = router;
})();