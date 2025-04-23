const functions = require("firebase-functions");
const express = require("express");
const admin = require("firebase-admin");

admin.initializeApp();
const app = express();

const authRouter = require("./routers/authRouter");
const userRouter = require("./routers/userRouter");
const stayRouter = require("./routers/stayRouter");

app.use(express.json());
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/stay", stayRouter);

exports.api = functions.https.onRequest(app);
