const express = require("express");
const router = express.Router(); // eslint-disable-line new-cap
const bcrypt = require("bcrypt");
const {createToken} = require("../util/jwtUtils");
const UserRepository = require("../repository/userRepository");

router.post("/register", async (req, res) => {
  try {
    const {email, password, role} = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "이메일, 비밀번호는 필수 입력 사항입니다.",
      });
    }

    if (!["student", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Role must be either 'student' or 'admin'",
      });
    }

    const isExist = await UserRepository.findByEmail(email);

    if (isExist) {
      return res.status(409).json({
        message: "이미 사용 중인 이메일 입니다.",
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    await UserRepository.save({
      email: email,
      passwordHash: passwordHash,
      role: role,
    });

    return res.status(200).json({
      message: "회원가입 완료",
    });
  } catch (error) {
    return res.status(500).json({
      message: "회원가입에 실패했습니다.",
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const {email, password} = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "이메일 또는 비밀번호를 입력해주세요.",
      });
    }

    const result = await UserRepository.findByEmail(email);

    if (!result) {
      return res.status(404).json({
        message: "등록되지 않은 회원입니다.",
      });
    }
    const user = result.data;

    const isValid = await validatePassword(password, user.passwordHash);

    if (!isValid) {
      return res.status(401).json({
        message: "비밀번호가 올바르지 않습니다.",
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      token: token,
      role: user.role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "로그인에 실패했습니다.",
      error: error.message,
    });
  }
});

const validatePassword = (password, savedPassword) => {
  return bcrypt.compare(password, savedPassword);
};

module.exports = router;
