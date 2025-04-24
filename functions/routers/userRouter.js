const express = require("express");
const router = express.Router(); // eslint-disable-line new-cap
const authenticate = require("../middleware/auth");
const userRepository = require("../repository/userRepository");
const semesterRepository = require("../repository/semesterRepository");

router.post("/semester", authenticate, async (req, res) => {
  const payload = req.user;

  const {semester, startDate, endDate, isLongTerm} = req.body;

  const result = await userRepository.findByEmail(payload.email);
  if (!result) {
    return res.status(404).json({
      message: "등록되지 않은 회원입니다.",
    });
  }
  const {ref: userRef} = result;

  await userRepository.updateIsLongTerm(userRef, isLongTerm);

  const semesterData = {
    semester: semester,
    startDate: startDate,
    endDate: endDate,
  };
  await semesterRepository.save(semesterData, userRef.id);

  return res.status(200).json({
    status: "ok",
  });
});

module.exports = router;
