module.exports = {
  secret: process.env.JWT_SECRET || "feedback_management_secret_key",
  jwtExpiration: process.env.JWT_EXPIRATION || 86400 // 24 hours
};