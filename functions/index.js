const functions = require("firebase-functions");
const express = require("express");
const admin = require("firebase-admin");

admin.initializeApp();
const app = express();

const usersRouter = require("./users/index");

app.use(express.json());
app.use("/api/users", usersRouter);

exports.api = functions.https.onRequest(app);
