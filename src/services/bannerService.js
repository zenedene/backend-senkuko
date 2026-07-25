import { v4 as uuidv4 } from 'uuid';
import bannerModel from '../models/bannerModel.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/uploadToCloudinary.js';

const getAllBanners = async () => {
  return await bannerModel.findAll();
};

const getActiveBanners = async () => {
  return await bannerModel.findAllActive();
};

const getBannerById = async (id) => {
  const banner = await bannerModel.findById(id);
  if (!banner) throw new Error('Banner not found');
  return banner;
};

const createBanner = async (file, data) => {
  if (!file) throw new Error('Banner image is required');

  const result = await uploadToCloudinary(file.buffer, "banners");

  return await bannerModel.create({
    id: uuidv4(),
    image_url: result.secure_url,
    public_id: result.public_id,
    title: data.title,
    sort_order: data.sort_order,
    is_active: data.is_active,
  });
};

const updateBanner = async (id, data) => {
  const existing = await bannerModel.findById(id);
  if (!existing) throw new Error('Banner not found');

  return await bannerModel.update(id, {
    image_url: existing.image_url,
    public_id: existing.public_id,
    title: data.title ?? existing.title,
    sort_order: data.sort_order ?? existing.sort_order,
    is_active: data.is_active ?? existing.is_active,
  });
};

const updateBannerImage = async (id, file) => {
  const existing = await bannerModel.findById(id);
  if (!existing) throw new Error('Banner not found');
  if (!file) throw new Error('No file uploaded');

  if (existing.public_id) {
    await deleteFromCloudinary(existing.public_id);
  }

  const result = await uploadToCloudinary(file.buffer, "banners");

  return await bannerModel.updateImage(id, result.secure_url, result.public_id);
};

const deleteBanner = async (id) => {
  const existing = await bannerModel.findById(id);
  if (!existing) throw new Error('Banner not found');

  if (existing.public_id) {
    await deleteFromCloudinary(existing.public_id);
  }

  const affected = await bannerModel.remove(id);
  if (!affected) throw new Error('Failed to delete banner');
  return { message: 'Banner deleted successfully' };
};

export default {
  getAllBanners,
  getActiveBanners,
  getBannerById,
  createBanner,
  updateBanner,
  updateBannerImage,
  deleteBanner,
};
