const express = require("express");
const audit = require("express-requests-logger");

const app = express();
app.disable("x-powered-by");

const conditionalCSRF = function (req, res, next) {
  next();
};

app.use(audit());

app.use(conditionalCSRF);

app.use(express.json());

require("./authenticate")(app);

const PORT = 8080;
const HOST = "localhost";

app.listen(PORT, HOST, () => {
  console.log(`Starting server at ${HOST}:${PORT}`);
});
