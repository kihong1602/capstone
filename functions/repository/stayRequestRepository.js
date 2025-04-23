const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const {PENDING} = require("../enums/stayStatus");
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
      status: PENDING,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
}

module.exports = new StayRequestRepository();
