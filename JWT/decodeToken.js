const jwt = require("jsonwebtoken");

module.exports = function decodeToken(token) {
  if (token) {
    let jwtSecretKey = "workshop";
    try {
      const verified = jwt.verify(token, jwtSecretKey, { algorithm: "HS256" });
      if (verified) {
        const data = jwt.decode(token, { complete: true });
        return data;
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  } else {
    return null;
  }
};
