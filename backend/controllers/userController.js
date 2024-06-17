import Post from "../models/Post.js";
import User from "../models/user.js";
import APPError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import cloudinary from "../config/cloudinary.js";

export const getAllUsers = catchAsync(async (req, res) => {
  // console.log(req.user._id);
  const users = await User.find().populate("posts").sort();
  res.status(200).json({
    status: "success",
    result: users.length,
    users,
  });
});
export const getOne = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new APPError(`id is not Found`, 404));
  }
  res.status(200).json({
    status: "success",
    result: user.length,
    user,
  });
});

export const getUserPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find({ author: req.user._id }).populate({
    path: "author",
    modal: "User",
    select: "username photo",
  });
  if (!posts) return next(new APPError("this user have not posted yet", 404));
  res.status(200).json({
    status: "success",
    result: posts.length,
    posts,
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new APPError("user is not found", 404));
  }
  // if (req.user._id != req.params.id) {
  //   return next(new APPError("you are not enable to delete this user", 403));
  // }
  res.status(200).json({
    status: "success",
    message: "user deleted success",
  });
});
export const updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new APPError(`this route is not allowed password updates`));
  }
  const updatedFields = {
    username: req.body.username,
    email: req.body.email,
  };

  if (req.file) {
    let encodedImage = `data:image/jpeg;base64,${req.file.buffer.toString(
      "base64"
    )}`;
    const result = await cloudinary.uploader.upload(encodedImage, {
      resource_type: "image",
      transformation: [
        { width: 500, height: 500, crop: "fill", gravity: "face" },
      ],
      encoding: "base64",
    });
    updatedFields.photo = result.url;
  }

  const user = await User.findByIdAndUpdate(req.params.id, updatedFields, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new APPError("user is not found", 404));
  }
  res.status(200).json({
    status: "success",
    message: "updated success",
    user,
  });
});
