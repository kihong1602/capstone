const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const dayjs = require("dayjs");
const db = getFirestore().collection("Penalties");

/** Penalty Repository*/
class PenaltyRepository {
  /** 벌점 내역 저장
   * @param {object} penalty - 벌점 객체
   * @param {string} penalty.userId - 회원 ID
   * @param {string} penalty.date - 벌점 부여 일자
   * @param {string} penalty.reason - 벌점 사유
   * @param {number} penalty.points - 부여 벌점
   * */
  async save(penalty) {
    const ref = db.doc();

    await ref.set({
      id: ref.id,
      userId: penalty.userId,
      date: penalty.date,
      reason: penalty.reason,
      points: penalty.points,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  /** 무단 외박 & 지각 입실 벌점 내역 저장
   * @param {string} date - 벌점 부여 일자
   * @param {Array<String>} noEntryStudents - 무단 외박자 내역
   * @param {Array<Object>} lateEntryStudents - 지각 입실자 내역
   * @param {string} lateEntryStudents.userId - 지각 입실자 ID
   * @param {string} lateEntryStudents.entryTime - 지각 입실 시간
   * */
  async batchSave(date, noEntryStudents, lateEntryStudents) {
    const batch = getFirestore().batch();

    const createdAt = FieldValue.serverTimestamp();
    for (const studentId of noEntryStudents) {
      const ref = db.doc();
      batch.set(ref, {
        id: ref.id,
        userId: studentId,
        date: date,
        reason: "무단 외박",
        points: 3,
        createdAt: createdAt,
      });
    }

    for (const student of lateEntryStudents) {
      const entryTime = dayjs(student.entryTime).format("HH:mm:ss");
      const ref = db.doc();
      batch.set(ref, {
        id: ref.id,
        userId: student.userId,
        date: date,
        reason: `17시 이후 입실 (${entryTime}`,
        points: 1,
        createdAt: createdAt,
      });
    }

    await batch.commit();
  }

  /** 회원 벌점 내역 조회
   * @param {string} userId
   * @return {Promise<Array<Object>>} */
  async findByUserId(userId) {
    const snapshot = await db
        .where("userId", "==", userId)
        .orderBy("date", "desc")
        .get();

    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        date: data.date,
        reason: data.reason,
        points: data.points,
      };
    });
  }
}

module.exports = new PenaltyRepository();
