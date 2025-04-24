const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const {StayStatus, StayStatusKo} = require("../enums/stayStatus");
const db = getFirestore().collection("StayRequests");

/** 외박 신청 Repository*/
class StayRequestRepository {
  /** 외박 신청 내역 저장
   * @param {Object} stayRequest
   * @param {string} userId*/
  async save(stayRequest, userId) {
    const ref = db.doc();
    await ref.set({
      id: ref.id,
      userId: userId,
      date: stayRequest.date,
      reason: stayRequest.reason,
      requestTime: stayRequest.requestTime,
      status: StayStatus.PENDING,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  /** 외박 신청 내역 조회
   * @param {string} userId*/
  async findByUserId(userId) {
    const snapshot = await db.where("userId", "==", userId)
        .orderBy("date", "desc")
        .get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.id,
        date: data.date,
        reason: data.reason,
        status: StayStatusKo[data.status] || "알 수 없음",
      };
    });
  }
}

module.exports = new StayRequestRepository();
