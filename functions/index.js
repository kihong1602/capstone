const functions = require("firebase-functions");
const express = require("express");
const admin = require("firebase-admin");
const {scheduledTask} = require("./routers/schedule");

admin.initializeApp();
const app = express();

const authRouter = require("./routers/authRouter");
const userRouter = require("./routers/userRouter");
const stayRouter = require("./routers/stayRouter");
const entryRouter = require("./routers/entryRouter");
const penaltyRouter = require("./routers/penaltyRouter");

app.use(express.json());
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/stay", stayRouter);
app.use("/entry", entryRouter);
app.use("/penalty", penaltyRouter);

exports.api = functions.https.onRequest(app);
exports.scheduledTask = scheduledTask;
