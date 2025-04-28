const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const db = getFirestore().collection("Users");

/** User Repository*/
class UserRepository {
  /** Email 기반 User 조회
   * @param {string} email
   * */
  async findByEmail(email) {
    const snapshot = await db
        .where("email", "==", email)
        .limit(1)
        .get();
    if (snapshot.empty) {
      return null;
    }
    const doc = snapshot.docs[0];
    return {
      ref: doc.ref,
      data: doc.data(),
    };
  }

  /** User 저장
   * @param {object} user*/
  async save(user) {
    const ref = db.doc();
    await ref.set({
      id: ref.id,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      name: "",
      language: "",
      isLongTerm: false,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  /** 장기 기숙사 여부 수정
   * @param {object} ref
   * @param {boolean} isLongTerm*/
  async updateIsLongTerm(ref, isLongTerm) {
    await ref.update({
      isLongTerm: isLongTerm,
    });
  }
}

module.exports = new UserRepository();
