const express = require("express");
const router = express.Router(); // eslint-disable-line new-cap
const authenticate = require("../middleware/auth");
const userRepository = require("../repository/user.repository");
const penaltyRepository = require("../repository/penalty.repository");

/** 벌점 조회 api*/
router.get("/me", authenticate, async (req, res) => {
  const payload = req.user;
  const {ref: userRef} = await userRepository.findByEmail(payload.email);

  const penalties = await penaltyRepository.findByUserId(userRef.id);
  return res.status(200).json(penalties);
});

module.exports = router;
