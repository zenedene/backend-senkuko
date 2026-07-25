import bannerService from '../services/bannerService.js';

const getAll = async (req, res) => {
  try {
    const data = await bannerService.getAllBanners();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getActive = async (req, res) => {
  try {
    const data = await bannerService.getActiveBanners();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const data = await bannerService.getBannerById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Banner not found' ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const data = await bannerService.createBanner(req.file, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Banner image is required' ? 400 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const data = await bannerService.updateBanner(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Banner not found' ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

const updateImage = async (req, res) => {
  try {
    const data = await bannerService.updateBannerImage(req.params.id, req.file);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === 'Banner not found' ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await bannerService.deleteBanner(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    const status = err.message === 'Banner not found' ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

export default { getAll, getActive, getById, create, update, updateImage, remove };
