const express = require("express");
const router = express.Router(); // eslint-disable-line new-cap
const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = getFirestore();
const JWT_SECRET = "your-jwt-secret-key"; // JWT Secret key는 추후 환경변수 예정

router.post("/register", async (req, res) => {
  try {
    const {email, password, role} = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and role are required",
      });
    }

    if (role !== "student" && role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'student' or 'admin'",
      });
    }

    const userQuery = await db.collection("Users")
        .where("email", "==", email)
        .get();

    if (!userQuery.empty) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const userRef = db.collection("Users").doc();

    await userRef.set({
      id: userRef.id,
      email: email,
      passwordHash: passwordHash,
      role: role,
      name: "", // 추후 업데이트할 수 있도록 빈 값으로 초기화
      language: "",
      isLongTerm: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      success: true,
      uid: userRef.id,
      message: "회원가입 완료",
    });
  } catch (error) {
    console.error("Error registering user:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const {email, password} = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "이메일 또는 비밀번호를 입력해주세요.",
      });
    }

    const query = await db.collection("Users")
        .where("email", "==", email)
        .limit(1)
        .get();

    if (query.empty) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userDoc = query.docs[0];
    const user = userDoc.data();

    const isValid = await validatePassword(password, user.passwordHash);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
        {
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        {expiresIn: "24h"},
    );

    return res.status(200).json({
      success: true,
      token: token,
      role: user.role,
    });
  } catch (error) {
    console.error("Error logging in:", error);

    // 기타 에러
    return res.status(500).json({
      success: false,
      message: "Failed to log in",
      error: error.message,
    });
  }
});

const validatePassword = (password, savedPassword) => {
  return bcrypt.compare(password, savedPassword);
};

module.exports = router;
