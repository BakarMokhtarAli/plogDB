import cloudinary from "../config/cloudinary.js";
import Post from "../models/Post.js";
import APPError from "../utils/AppError.js";

import APIFeatures from "../utils/apiFeatures.js";
import catchAsync from "../utils/catchAsync.js";

export const getAllPosts = catchAsync(async (req, res, next) => {
  const feature = new APIFeatures(Post.find(), req.query)
    .filter()
    .limitingFields()
    .sort()
    .paginate();

  const posts = await feature.query.populate({
    path: "author",
    model: "User",
    select: "username photo",
  });
  res.status(200).json({
    status: `success`,
    results: posts.length,
    data: {
      posts,
    },
  });
});

export const getOnePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new APPError("post is not available", 404));
  res.status(200).json({
    status: "success",
    result: post.length,
    post,
  });
});

export const createPost = catchAsync(async (req, res, next) => {
  const currentUser = req.user;

  const { title, content } = req.body;
  let result;
  if (req.file) {
    let encodedImage = `data:image/jpeg;base64,${req.file.buffer.toString(
      "base64"
    )}`;
    result = await cloudinary.uploader.upload(encodedImage, {
      resource_type: "image",
      transformation: [{ width: 500, height: 500, crop: "limit" }],
      encoding: "base64",
    });
  }
  const postInfo = new Post({
    title,
    content,
    image: result?.url || null,
    author: currentUser,
  });
  await postInfo.save();
  res.status(201).json({
    status: "success",
    message: "post created success",
    post: postInfo,
  });
});
export const updatePost = catchAsync(async (req, res, next) => {
  const currentUser = req.user;

  let updatedFields = {
    title: req.body.title,
    content: req.body.content,
  };
  if (req.file) {
    let encodedImage = `data:image/jpeg;base64,${req.file.buffer.toString(
      "base64"
    )}`;
    const result = await cloudinary.uploader.upload(encodedImage, {
      resource_type: "image",
      transformation: [{ width: 500, height: 500, crop: "limit" }],
      encoding: "base64",
    });
    updatedFields.image = result.url;
  }
  const post = await Post.findByIdAndUpdate(req.params.id, updatedFields, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    message: "post updated success",
  });
});

export const deletePost = catchAsync(async (req, res, next) => {
  const deletedPost = await Post.findByIdAndDelete(req.params.id);
  if (!deletePost) return next(new APPError("post is not available", 404));
  res.status(200).json({
    status: "success",
    message: "post deleted success",
  });
});
