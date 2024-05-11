"use strict";
const grpc = require('@grpc/grpc-js');
const protoLoader= require('@grpc/proto-loader');
const dotenv= require('dotenv');
const path= require('path');

(()=>{


    const filePath =`${__dirname}`
    const testPath= `./../Detection-/proto/detection.rpc.proto`
    const protoPath= `${filePath}/${testPath}`
    const envPath=`${__dirname}/.env`
    dotenv.config({path:envPath})


    const packageDefinition = protoLoader.loadSync(protoPath, {
        keepCase: true,
        longs: 'string',
        defaults: true,
      }) 
      
      const protoDefinition = grpc.loadPackageDefinition(packageDefinition)


      const detectionService = protoDefinition.example.detection.rpc.DetectionService;
    
      const client = new detectionService(
          `localhost:4000`,
          grpc.credentials.createInsecure()
      );

      module.exports=client

})();


