"use strict";
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});
console.log(path.resolve(process.cwd(), ".env"));
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { dbHelper, mysqlHelper } = require("./helper");
const packageDefinition = protoLoader.loadSync("./proto/detection.rpc.proto", {
  keepCase: true,
  longs: "string",
  defaults: true,
});
const port = process.env.GRPC_PORT;
const server = new grpc.Server();
const simpleProto = grpc.loadPackageDefinition(packageDefinition);
// Grpc Methods done here
const userServiceLoader = require('./modules/users/index');
const adminServiceLoader =require("./modules/admin/index")

server.addService(simpleProto.example.detection.rpc.DetectionService.service, {
  registerUser: userServiceLoader.registerUser,
  LoginUser:userServiceLoader.LoginUser,
  ForgotPassword:userServiceLoader.ForgotPassword,
  ResetDevice:userServiceLoader.ResetDevice,

  //admin controller
  getRiskDetails:adminServiceLoader.getRiskDetails
});

server.bindAsync(
  `0.0.0.0:${port}`,
  grpc.ServerCredentials.createInsecure(),
  async (err, port) => {
    if (err) return err;
    console.log("Server running on port ", port);

    await mysqlHelper.init();
  }
);
