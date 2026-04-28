import express from "express";
import path from "path";
const router = express.Router();
import multer from "multer";
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
const upload = multer({ storage });
import {
  getMenus,
  getMenuById,
  deleteMenu,
  createMenu,
  updateMenu,
  getAllMenus,
} from "./menuController.js";
import { protect, admin } from "../../middleware/authMiddleware.js";
const cpUpload = upload.fields([{ name: "image" }, { name: "gallery" }]);

const uploadFiles = (req, res, next) => {
  const values = JSON.parse(req.body.values);
  req.body = { ...req.body, ...values };
  const image = req.files.image;
  if (image && image.length > 0) {
    req.body.image = `/${image[0].path}`;
  }
  const gallery = req.files.gallery;
  if (gallery && gallery.length > 0) {
    const newImages = gallery.map((item) => {
      return `/${item.path}`;
    });
    req.body.gallery = newImages;
  }
  next();
};

router.route("/").get(getMenus).post(protect, createMenu);
router.route("/all").get(getAllMenus);
router
  .route("/:id")
  .get(getMenuById)
  .delete(protect, admin, deleteMenu)
  .put(protect, updateMenu);

export default router;
