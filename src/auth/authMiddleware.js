import authService from "./authService.js";

const authMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token is missing or invalid",
    });
  }

  const token = authorization.split(" ")[1];

  try {
    const payload = authService.verifyToken(token);
    if (payload.status && payload.status !== "active") {
      return res
        .status(403)
        .json({ success: false, message: "Account is not active" });
    }
    req.user = payload;
    next();
  } catch (err) {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    next();
  };
};

export default authMiddleware;
export { authorizeRole };
