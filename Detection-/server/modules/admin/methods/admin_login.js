"use strict";
const httpStatus = require("http-status");
const { loginAdminSql } = require("./../sql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config({});

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId }, // is_admin, is_pharmacist, is_doctor
    process.env.ACCESS_TOKEN_SECRET_KEY,
    {
      expiresIn: "55m",
    }
  );
  const refreshToken = jwt.sign(
    { userId }, //, is_admin, is_pharmacist, is_doctor
    process.env.REFRESH_TOKEN_SECRET_KEY,
    {
      expiresIn: "7d",
    }
  );
  return { accessToken, refreshToken };
};

module.exports = async (call, callback) => {
  try {
    let response = {
        status: httpStatus.BAD_REQUEST,
        message: "Create Failed",
      };

    const { email, password } = call.request;

    if (!email || !password)
    return callback(null,(response={status:httpStatus.BAD_REQUEST, message: "Email and password are required"}))



    const user = await loginAdminSql(email);

    if (!user) {
        return callback(null,(response={status:httpStatus.BAD_REQUEST, message: "User not found"}));
    }

    const hashedPassword = user.data.password;

    const passwordMatch = await bcrypt.compare(password, hashedPassword);

    if (!passwordMatch) {
        return callback(null,(response={status:httpStatus[401], message: "Invalid password"}));
    }

    const { accessToken, refreshToken } = generateTokens(user.data.id);
    return callback(null,(response={status:httpStatus.OK,
        message:"login Success",
        accessToken,
        refreshToken}))
  } catch (error) {
    console.error(error);
    return callback(error)
  }
};
