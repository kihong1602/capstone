const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const db = getFirestore().collection("EntryLogs");

/** 출입 기록 Repository*/
class EntryLogRepository {
  /** 출입 기록 저장
   * @param {Object} entryLog
   * */
  async save(entryLog) {
    const ref = db.doc();
    await ref.set({
      id: ref.id,
      userId: entryLog.userId,
      timestamp: entryLog.timestamp,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  /** 어제 기숙사 출입 기록 조회
   * @param {string} yesterday - yyyy-MM-dd*/
  async findByYesterday(yesterday) {
    const startTimestamp = `${yesterday}T00:00:00`;
    const endTimestamp = `${yesterday}T23:59:59`;

    const snapshot = await db
        .where("timestamp", ">=", startTimestamp)
        .where("timestamp", "<=", endTimestamp)
        .get();
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        userId: data.userId,
        timestamp: data.timestamp,
      };
    });
  }
}

module.exports = new EntryLogRepository();
