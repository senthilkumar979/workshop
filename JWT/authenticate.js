const { MongoClient } = require("mongodb");
const generateToken = require("./generateToken");
const decodeToken = require("./decodeToken");

const url =
  "mongodb+srv://admin:admin@workshop.kt1qxza.mongodb.net/?retryWrites=true&w=majority&appName=Workshop";

module.exports = function (app) {
  app.post("/api/authenticate", async (req, res) => {
    if (req.body?.email && req.body?.password) {
      const client = new MongoClient(url);
      await client.connect();
      const query = { email: req.body.email, password: req.body.password };
      try {
        const users = client.db("workshop").collection("users").find(query);
        for await (const user of users) {
          if (user) {
            res
              .status(200)
              .cookie("access_token", generateToken(user), {
                expires: new Date(Date.now() + 8 * 3600000), // 8 hours
              })
              .send({
                id: user._id,
                name: user.name,
              });
          }
        }
        res.status(200).send({error: 'Wrong Credentials'});
      } catch (err) {
        console.log("error", err);
      }
    } else {
      res.send(400);
    }
  });

  app.get("/api/myaccount", async (req, res) => {
    const token = req.header("access-token");
    if (token) {
      const data = decodeToken(token);
      if (data) {
        res.status(200).send({
          id: data.payload.id,
          name: data.payload.name,
        });
      } else {
        res.send(401);
      }
    } else {
      res.send(401);
    }
  });
};
