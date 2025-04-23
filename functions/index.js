const functions = require("firebase-functions");
const express = require("express");
const admin = require("firebase-admin");

admin.initializeApp();
const app = express();

const authRouter = require("./auth/index");

app.use(express.json());
app.use("/auth", authRouter);

exports.api = functions.https.onRequest(app);
