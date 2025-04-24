const StayStatus = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
});

const StayStatusKo = Object.freeze({
  [StayStatus.PENDING]: "대기",
  [StayStatus.APPROVED]: "승인",
  [StayStatus.REJECTED]: "거절",
  [StayStatus.CANCELLED]: "취소",
});

module.exports = {
  StayStatus,
  StayStatusKo,
};
