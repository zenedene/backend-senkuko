import productService from "../services/productService.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { v4 as uuidv4 } from "uuid";
import pool from "../config/database.js";

const getAll = async (req, res) => {
  try {
    const data = await productService.getAllProducts();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getWithVariantsAndPrice = async (req, res) => {
  try {
    const data = await productService.getProductWithVariantsAndPrice(
      req.params.id,
      req.query.price_list_id,
    );
    res.json({ success: true, data });
  } catch (err) {
    const status = ["Product not found", "Price list not found"].includes(
      err.message,
    )
      ? 404
      : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const data = await productService.getProductById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === "Product not found" ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

const getWithVariants = async (req, res) => {
  try {
    const data = await productService.getProductWithVariants(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === "Product not found" ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const data = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const data = await productService.updateProduct(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    const status = err.message === "Product not found" ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    const status = err.message === "Product not found" ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

const uploadImage = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const result = await uploadToCloudinary(file.buffer);

    await pool.query(
      `INSERT INTO product_images (id, product_id, image_url, public_id, is_primary, created_at)
       VALUES (?, ?, ?, ?, 0, NOW())`,
      [uuidv4(), id, result.secure_url, result.public_id],
    );

    res.json({
      success: true,
      image_url: result.secure_url,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getImages = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, created_at ASC`,
      [req.params.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const file = req.file;

    const [existing] = await pool.query(
      `SELECT * FROM product_images WHERE id = ? AND product_id = ?`,
      [imageId, id]
    );

    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    // Hapus gambar lama di cloudinary
    const { deleteFromCloudinary } = await import('../utils/uploadToCloudinary.js');
    await deleteFromCloudinary(existing[0].public_id);

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(file.buffer);

    await pool.query(
      `UPDATE product_images SET image_url = ?, public_id = ? WHERE id = ?`,
      [result.secure_url, result.public_id, imageId]
    );

    res.json({ success: true, image_url: result.secure_url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const setPrimaryImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const [existing] = await pool.query(
      `SELECT * FROM product_images WHERE id = ? AND product_id = ?`,
      [imageId, id]
    );

    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    // Reset semua is_primary ke false dulu
    await pool.query(
      `UPDATE product_images SET is_primary = false WHERE product_id = ?`,
      [id]
    );

    // Set image yang dipilih sebagai primary
    await pool.query(
      `UPDATE product_images SET is_primary = true WHERE id = ?`,
      [imageId]
    );

    res.json({ success: true, message: 'Primary image updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const [existing] = await pool.query(
      `SELECT * FROM product_images WHERE id = ? AND product_id = ?`,
      [imageId, id]
    );

    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    // Hapus dari cloudinary
    const { deleteFromCloudinary } = await import('../utils/uploadToCloudinary.js');
    await deleteFromCloudinary(existing[0].public_id);

    await pool.query(`DELETE FROM product_images WHERE id = ?`, [imageId]);

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export default {
  getAll,
  getById,
  getWithVariants,
  getWithVariantsAndPrice,
  create,
  update,
  remove,
  uploadImage,
  getImages,
  updateImage,
  setPrimaryImage,
  deleteImage,
};
