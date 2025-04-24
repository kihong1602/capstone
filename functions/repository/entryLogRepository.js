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
}

module.exports = new EntryLogRepository();
