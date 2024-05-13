const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const databaseHelper = require("./../../database/mysql");
dotenv.config({});

async function authenticate(req, res, next) {
  try {
    let token = req.headers.authorization;
    if (!token) {
      console.error("token not found in the request headers");
      return res.status(401).json({ error: "token not found in the request headers" });
    }
    let decoded = jwt.verify(
      token,
      "abcd1234"
    );
    if (!decoded) {
      console.error("Failed to decode the token.");
      return res.status(401).json({ error: "Failed to decode the token" });
    }
    if (decoded.user) {
      let query = await databaseHelper.format(`select uuid from Detection.User where mobile_number = "${req.body.mobileNumber}"`);
      let [result] = await databaseHelper.query(query);
      if (result && result.length>0 &&  result[0].uuid == decoded.user) {
        next();

      } else {
        return res.status(401).json({ error: "Invalid user" });
      }
    }
  } catch (error) {
    console.error("Error while verifying token:", error.message);
    return res.status(401).json({ error: "Token verification failed" });
  }
}

module.exports = authenticate;
