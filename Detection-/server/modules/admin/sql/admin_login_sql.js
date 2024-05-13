"use strict";
const dbHelper =require("./../../../helper/mysql")
const httpStatus = require("http-status");



// const hashHelper = require("./../helpers/hashHelper");

module.exports = async (email) => {
  try {
    const query = await dbHelper.format(`SELECT * FROM Detection.admins WHERE email = ?`,[email])
    const [result] = await dbHelper.query(query);
    if(result && result.length>0)
    {
        return {status:200,message:"ok",data:result[0]}
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};
