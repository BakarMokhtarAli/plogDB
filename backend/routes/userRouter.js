import express from "express";
import {
  getAllUsers,
  getOne,
  updateUser,
  deleteUser,
  getUserPosts,
} from "../controllers/userController.js";
import {
  SignIn,
  forgotPassword,
  protect,
  resetPassword,
  signUp,
  updatePassword,
  verifyCode,
  // verifyEmail,
} from "../controllers/authController.js";
import upload from "../config/multer.js";

const router = express.Router();

// router.get("/verify-email", verifyEmail);
router.route("/").get(protect, getAllUsers);
router.route("/posts").get(protect, getUserPosts);
router.post("/sign-up", signUp);
router.post("/sign-in", SignIn);

router.post("/verify-code", verifyCode);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.route("/:id").get(protect, getOne);
router.post("/update-password", protect, updatePassword);
router.post("/:id", protect, upload.single("photo"), updateUser);
router.delete("/delete/:id", protect, deleteUser);

export default router;
