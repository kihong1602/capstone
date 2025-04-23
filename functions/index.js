const {logger} = require("firebase-functions/logger");
const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");

const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

initializeApp();

exports.makeuppercase = onDocumentCreated("/messages/{documentId}", (event) => {
  const original = event.data.data().original;
  logger.log("Uppercasing", event.params.documentId, original);
  const uppercase = original.toUpperCase();
  return event.data.ref.set({uppercase}, {merge: true});
});

exports.addmessage = onRequest(async (req, res) => {
  const original = req.query.text;
  const writeResult = await getFirestore()
      .collection("messages")
      .add({original: original});
  res.json({result: `Message with ID: ${writeResult.id} added.`});
});
