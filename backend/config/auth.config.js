module.exports = {
    secret: process.env.ACCESS_TOKEN_SECRET || "jaihoallahki",
    jwtExpiration: 86400,           // 24 hours (in seconds)
    jwtRefreshExpiration: 604800,   // 7 days (in seconds)
  };