import express from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getOnePost,
  updatePost,
} from "../controllers/postController.js";
import { protect } from "../controllers/authController.js";
import upload from "../config/multer.js";

const router = express.Router();

router
  .route("/")
  .get(getAllPosts)
  .post(protect, upload.single("image"), createPost);

router
  .route("/:id")
  .get(protect, getOnePost)
  .delete(protect, deletePost)
  .patch(protect, upload.single("image"), updatePost);

export default router;
