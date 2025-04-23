const express = require("express");
const router = express.Router(); // eslint-disable-line new-cap
const authenticate = require("../../middleware/auth");
const userRepository = require("../../repository/userRepository");
const StayRequestRepository = require("../../repository/stayRequestRepository");

router.post("/submit", authenticate, async (req, res) => {
  const payload = req.user;
  const {date, reason, requestTime} = req.body;

  if (!reason || reason.trim() === "") {
    return res.status(400).json({
      message: "외박 사유를 입력해주세요.",
    });
  }
  // 신청일자 유효성 검증 필요

  const result = await userRepository.findByEmail(payload.email);
  if (!result) {
    return res.status(404).json({
      message: "등록되지 않은 회원입니다.",
    });
  }
  const userRef = result.ref;

  const stayRequest = {
    date: date,
    reason: reason,
    requestTime: requestTime,
  };

  await StayRequestRepository.save(stayRequest, userRef.id);

  return res.status(200).json({
    success: true,
    message: "외박 신청 완료",
  });
});

module.exports = router;
