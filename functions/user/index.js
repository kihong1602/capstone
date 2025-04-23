const express = require("express");
const router = express.Router(); // eslint-disable-line new-cap
const {getFirestore} = require("firebase-admin/firestore");
const authenticate = require("../middleware/auth");

const db = getFirestore();

router.post("/semester", authenticate, async (req, res) => {
  const payload = req.user;

  const {semester, startDate, endDate, isLongTerm} = req.body;

  const query = await db.collection("Users")
      .where("email", "==", payload.email)
      .get();

  if (query.empty) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const user = query.docs[0].ref;
  await user.update({
    isLongTerm: isLongTerm,
  });
  const semesterRef = db.collection("Semesters").doc();

  await semesterRef.set({
    id: semesterRef.id,
    userId: user.id,
    semester: semester,
    startDate: startDate,
    endDate: endDate,
  });

  return res.status(200).json({
    status: "ok",
  });
});

module.exports = router;
