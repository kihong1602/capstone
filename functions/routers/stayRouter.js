const express = require("express");
const router = express.Router(); // eslint-disable-line new-cap
const authenticate = require("../middleware/auth");
const userRepository = require("../repository/user.repository");
const stayRequestRepository = require("../repository/stayRequest.repository");
const penaltyRepository = require("../repository/penalty.repository");
const dayjs = require("dayjs");

router.post("/submit", authenticate, async (req, res) => {
  const payload = req.user;
  const {date, reason, requestTime} = req.body;

  if (!reason || reason.trim() === "") {
    return res.status(400).json({
      message: "외박 사유를 입력해주세요.",
    });
  }
  // 신청일자 유효성 검증 필요 ( 오늘 이후 날짜만, 그리고 이미 등록된 날짜)
  const today = dayjs().format("YYYY-MM-DD");
  if (dayjs(date).isBefore(today)) {
    return res.status(400).json({
      message: "오늘 또는 이후 날자만 외박 신청이 가능합니다.",
    });
  }

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

  await stayRequestRepository.save(stayRequest, userRef.id);

  const [hours, minutes] = requestTime.split(":");
  const submitTime = dayjs().hour(parseInt(hours)).minute(parseInt(minutes));
  const penaltyTime = dayjs().hour(16).minute(0).second(0);
  if (submitTime.isAfter(penaltyTime)) {
    const penalty = {
      userId: userRef.id,
      date: dayjs().format("YYYY-MM-DD"),
      reason: "외박 신청 시간 초과",
      points: 1,
    };
    await penaltyRepository.save(penalty);
  }

  return res.status(200).json({
    success: true,
    message: "외박 신청 완료",
  });
});

router.get("/history", authenticate, async (req, res) => {
  const payload = req.user;

  const result = await userRepository.findByEmail(payload.email);
  if (!result) {
    return res.status(404).json({
      message: "등록되지 않은 회원입니다.",
    });
  }
  const {ref: userRef} = result;

  const stayRequests = await stayRequestRepository.findByUserId(userRef.id);

  return res.status(200).json({
    stayRequests,
  });
});

module.exports = router;
