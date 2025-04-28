const express = require("express");
const router = express.Router(); // eslint-disable-line new-cap
const authenticate = require("../middleware/auth");

const userRepository = require("../repository/user.repository");
const entryLogRepository = require("../repository/entryLog.repository");

router.post("/record", authenticate, async (req, res) => {
  const payload = req.user;
  const {timestamp} = req.body;

  const result = await userRepository.findByEmail(payload.email);
  if (!result) {
    return res.status(404).json({
      message: "등록되지 않은 회원입니다.",
    });
  }

  const {ref: userRef} = result;

  const entryLog = {
    userId: userRef.id,
    timestamp: timestamp,
  };
  await entryLogRepository.save(entryLog);

  return res.status(200).json({
    recorded: true,
  });
});

module.exports = router;
