const {getFirestore} = require("firebase-admin/firestore");
const db = getFirestore().collection("Semesters");

/** Semester Repository*/
class SemesterRepository {
  /** Semester 저장
   * @param {object} semester
   * @param {string} userId*/
  async save(semester, userId) {
    const ref = db.doc();
    await ref.set({
      id: ref.id,
      userId: userId,
      semester: semester.semester,
      startDate: semester.startDate,
      endDate: semester.endDate,
    });
  }
}

module.exports = new SemesterRepository();
