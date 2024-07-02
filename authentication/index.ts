const express = require("express");

const app = express();
app.disable("x-powered-by");

const conditionalCSRF = function (req, res, next) {
    next();
};

app.use(express.json());

app.use(conditionalCSRF);

require("./authenticate")(app);

const PORT = 8080;
const HOST = "localhost";

app.listen(PORT, HOST, () => {
    console.log(`Starting server at ${HOST}:${PORT}`);
});
