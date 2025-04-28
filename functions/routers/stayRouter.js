const express = require("express");
const router = express.Router(); // eslint-disable-line new-cap
const authenticate = require("../middleware/auth");
const userRepository = require("../repository/user.repository");
const stayRequestRepository = require("../repository/stayRequest.repository");
const penaltyRepository = require("../repository/penalty.repository");
const dayjs = require("dayjs");
const {StayStatus} = require("../enums/stayStatus");

/** 외박 신청 API*/
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

/** 외박 신청내역 조회 API*/
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

/** 외박 신청내역 수정 API*/
router.put("/update/:id", authenticate, async (req, res) => {
  const stayRequestId = req.params.id;
  const payload = req.user;
  const {date, reason, requestTime} = req.body;

  const user = await userRepository.findByEmail(payload.email);
  if (!user) {
    return res.status(404).json({
      message: "회원 정보가 존재하지 않습니다.",
    });
  }
  const userRef = user.ref;

  const stayRequest = await stayRequestRepository.findById(stayRequestId);

  if (!stayRequest) {
    return res.status(404).json({
      message: "신청 내역이 존재하지 않습니다.",
    });
  }

  const data = stayRequest.data;

  if (data.userId !== userRef.id) {
    return res.status(403).json({
      message: "본인의 신청 내역만 수정할 수 있습니다.",
    });
  }

  if (data.status !== StayStatus.PENDING) {
    return res.status(400).json({
      message: "이미 처리된 신청 내역은 수정할 수 없습니다.",
    });
  }

  const today = dayjs().format("YYYY-MM-DD");
  if (dayjs(date).isBefore(today)) {
    return res.status(400).json({
      message: "오늘 이후 날짜만 외박 신청이 가능합니다.",
    });
  }

  await stayRequestRepository.update(stayRequestId, {
    reason: reason,
    date: date,
    requestTime: requestTime,
  });

  return res.status(200).json({
    success: true,
    message: "신청 내역 수정 완료",
  });
});

/** 외박 신청 취소 API*/
router.delete("/cancel/:id", authenticate, async (req, res) => {
  const payload = req.user;
  const id = req.params.id;
  const stayRequest = await stayRequestRepository.findById(id);

  const userResult = await userRepository.findByEmail(payload.email);
  if (!userResult) {
    return res.status(404).json({
      message: "회원 정보가 존재하지 않습니다.",
    });
  }

  if (!stayRequest) {
    return res.status(404).json({
      message: "신청 내역이 존재하지 않습니다.",
    });
  }

  const data = stayRequest.data;

  if (data.userId !== userResult.ref.id) {
    return res.status(403).json({
      message: "본인의 신청 내역만 취소할 수 있습니다.",
    });
  }

  if (data.status !== StayStatus.PENDING) {
    return res.status(400).json({
      message: "이미 처리된 신청 내역은 수정할 수 없습니다.",
    });
  }

  await stayRequestRepository.updateStatus(id, StayStatus.CANCELLED);

  return res.status(200).json({
    success: true,
    message: "외박 신청 취소 완료",
  });
});

module.exports = router;
