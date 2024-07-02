const {MongoClient} = require("mongodb");
const generateToken = require("./generateToken");
const decodeToken = require("./decodeToken");
const otplib = require("otplib");
const qrcode = require('qrcode');

const url = "mongodb+srv://admin:admin@workshop.kt1qxza.mongodb.net/?retryWrites=true&w=majority&appName=Workshop";

module.exports = function (app) {
    app.post("/api/authenticate", async (req, res) => {
        if (req.body?.email && req.body?.password) {
            const client = new MongoClient(url);
            await client.connect();
            const query = {email: req.body.email, password: req.body.password};
            try {
                const users = client.db("workshop").collection("users").find(query);
                for await (const user of users) {
                    if (user.secret) {
                        res.status(403).json({error: 'totp_verification_required'});
                    } else {
                        const secret = otplib.authenticator.generateSecret();
                        const keyUri = otplib.authenticator.keyuri(user.email, 'Workshop', secret);
                        const secretQrCode = await qrcode.toDataURL(keyUri);
                        const updateDoc = {
                            $set: {
                                secret
                            }
                        }
                        await client.db("workshop").collection("users").updateOne(query, updateDoc);

                        res.status(403).json({error: 'missing_totp', secretQrCode});
                    }
                }
                // res.status(200).send({error: 'Wrong Credentials'});

            } catch (err) {
                res.status(200).send({error: 'Something went wrong'});
            } finally {
                await client.close();
            }
        } else {
            res.status(400).send({error: 'Wrong Credentials'});
        }
    });

    app.get("/api/myaccount", async (req, res) => {
        const bearerToken = req.header("Authorization");
        if (bearerToken && bearerToken.slice(0, 7) === 'Bearer ') {
            const jwt = bearerToken.slice(7, bearerToken.length);
            const data = decodeToken(jwt);
            if (data) {
                res.status(200).send({
                    id: data.payload.id, name: data.payload.name,
                });
            } else {
                res.send(401);
            }
        } else {
            res.send(401);
        }
    });

    app.post("/api/verify-otp", async (req, res) => {
        const otp = req.body.otp;
        const email = req.body.email;

        if (otp && email) {
            const client = new MongoClient(url);
            await client.connect();
            const query = {email};
            try {
                const users = client.db("workshop").collection("users").find(query);
                for await (const user of users) {
                    if (user && user.secret) {
                        const totpVerified = otplib.authenticator.check(otp, user.secret);
                        if (!totpVerified) {
                            res.status(400).json({error: 'Invalid OTP code'});
                        } else {
                            const token = generateToken(user);
                            res
                                .status(200)
                                .set('Authorization', `Bearer ${token}`)
                                .set('Access-Control-Expose-Headers', 'Authorization')
                                .cookie("access_token", token, {
                                    expires: new Date(Date.now() + 8 * 3600000)
                                })
                                .send({
                                    id: user._id, name: user.name,
                                });
                        }
                    }
                }
            } catch {
                res.send(401);
            } finally {
                await client.close();
            }
        } else {
            res.send(401);
        }
    });
};
