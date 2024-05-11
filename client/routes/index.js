"use strict";
const express = require('express');
const router = express.Router();



(() => {
      const detectionRoutes = require("./main_routes");
      router.use("/detection",detectionRoutes);
      router.use("/loginUser",detectionRoutes);
      router.use("/forgotPassword",detectionRoutes);
      router.use("/resetDevice",detectionRoutes);
      router.use("./getRiskDetails",detectionRoutes);


      //add here .......
    module.exports = router;
})()