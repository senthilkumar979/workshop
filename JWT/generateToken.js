const jwt = require("jsonwebtoken");

module.exports = function generateToken(user) {
    if (user) {
        let jwtSecretKey = "workshop";
        const token = jwt.sign(
            {id: user._id, name: user.name, iat: Date.now()},
            jwtSecretKey,
            {
                algorithm: "HS256",
                expiresIn: '10',
                header: {
                    name: 'Senthil',
                    secret: 'xyz'
                }
            }
        );
        return token;
    }
    return "";
};
