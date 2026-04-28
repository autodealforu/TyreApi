import express from "express";
const router = express.Router();

import {
  getCollections,
  getCollectionById,
  deleteCollection,
  createCollection,
  updateCollection,
  getAllCollections,
} from "./collectionController.js";
import { protect, admin } from "../../middleware/authMiddleware.js";

router.route("/").get(getCollections).post(protect, createCollection);
router.route("/all").get(getAllCollections);
router
  .route("/:id")
  .get(getCollectionById)
  .delete(protect, admin, deleteCollection)
  .put(protect, updateCollection);

export default router;
