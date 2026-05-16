const jwt = require("jsonwebtoken");

function signToken(userId, jwtSecret, expiresIn) {
  return jwt.sign({ sub: String(userId) }, jwtSecret, { expiresIn });
}

function verifyToken(token, jwtSecret) {
  return jwt.verify(token, jwtSecret);
}

module.exports = { signToken, verifyToken };
