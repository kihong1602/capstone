const functions = require("firebase-functions");
const express = require("express");
const admin = require("firebase-admin");

admin.initializeApp();
const app = express();

const authRouter = require("./routers/auth/index");
const userRouter = require("./routers/user/index");
const stayRouter = require("./routers/stay/index");

app.use(express.json());
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/stay", stayRouter);

exports.api = functions.https.onRequest(app);
