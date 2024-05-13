const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config({});

function authenticate(req, res, next) {
  try {
    let token = req.headers.authorization;
    if (!token) {
      console.error("token not found in the request headers");
      return res.status(401).json({ error: "Token is missing" });
    }
    let decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET 
    );
    if (!decoded) {
      console.error("Failed to decode the token.");
      return res.status(401).json({ error: "Failed to decode the token" });
    }
    next();
  } catch (error) { 
    console.error("Error while verifying token:", error.message);
    return res.status(401).json({ error: "Token verification failed" });
  }
}

module.exports = authenticate;
