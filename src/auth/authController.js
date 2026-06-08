import authService from "./authService.js";

const login = async (req, res) => {
  try {
    const data = await authService.login(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const me = async (req, res) => {
  try {
    const profile = await authService.getProfile(req.user.id, req.user.role);
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};

export default {
  login,
  me,
};
