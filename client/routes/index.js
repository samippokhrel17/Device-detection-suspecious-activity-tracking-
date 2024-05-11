"use strict";
const express = require('express');
const router = express.Router();



(() => {
      const detectionRoutes = require("./main_routes");
      router.use("/detection",detectionRoutes);


      //add here .......
    module.exports = router;
})()