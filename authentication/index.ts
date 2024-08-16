const express = require("express");
const cors = require("cors");
const app = express();
app.disable("x-powered-by");

const conditionalCSRF = function (req, res, next) {
    next();
};

app.use(express.json());
app.use(cors());


app.use(conditionalCSRF);

require("./authenticate")(app);

const PORT = 9050;
const HOST = "localhost";

app.listen(PORT, HOST, () => {
    console.log(`Starting server at ${HOST}:${PORT}`);
});
