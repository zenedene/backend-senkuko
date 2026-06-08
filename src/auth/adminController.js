import adminService from "./adminService.js";

const login = async (req, res) => {
  try {
    const data = await adminService.login(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const addCustomer = async (req, res) => {
  try {
    const data = await adminService.addCustomer(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export default {
  login,
  addCustomer,
};
