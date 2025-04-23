const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const createToken = (user) => {
  const payload = {
    email: user.email,
    role: user.role,
  };

  return jwt.sign(
      payload,
      JWT_SECRET,
      {expiresIn: "24h"},
  );
};

const getPayload = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token");
  }
};

module.exports = {
  createToken,
  getPayload,
};
