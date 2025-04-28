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

  /** ID 기반 외박 신청 내역 조회
   * @param {string} id - 외박 신청 내역 ID
   * */
  async findById(id) {
    const doc = await db.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return {
      ref: doc.ref,
      data: doc.data(),
    };
  }

  /** 어제 외박신청 내역 조회
   * @param {string} yesterday
   * @return {Set<String>} 승인된 외박 신청이 있는 UserID Set*/
  async findByYesterday(yesterday) {
    const snapshot = await db
        .where("date", "==", yesterday)
        .where("status", "==", StayStatus.APPROVED)
        .get();
    const stayRequests = new Set();
    snapshot.docs.map((doc) => {
      const data = doc.data();
      stayRequests.add(data.userId);
    });
    return stayRequests;
  }

  /** 외박 신청 내역 수정
   * @param {string} id - 외박 신청내역 ID
   * @param {Object} data - 변경할 데이터
   * @param {string} data.reason - 외박 신청 사유
   * @param {string} data.date - 외박 신청 일자
   * @param {string} data.requestTime - 수정 시간
   * */
  async update(id, data) {
    await db.doc(id).update({
      reason: data.reason,
      date: data.date,
      requestTime: data.requestTime,
    });
  }

  /** 외박 신청 내역 상태 변경
   * @param {string} id - 외박 신청내역 ID
   * @param {string} status - 변경할 상태 (StayStatus)*/
  async updateStatus(id, status) {
    await db.doc(id).update({
      status: status,
    });
  }
}

module.exports = new StayRequestRepository();
