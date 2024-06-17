import User from "../models/user.js";
import catchAsync from "../utils/catchAsync.js";
import APPError from "../utils/AppError.js";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/config.js";
import sendVerificationEmail from "../utils/sendEmail.js";
import sendPasswordResetEmail from "../utils/sendPasswordResetEmail.js";
import crypto from "crypto";

export const signUp = catchAsync(async (req, res, next) => {
  const { username, email, password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    return next(new APPError("Passwords do not match", 400));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new APPError("Email already exists", 400));
  }

  // Generate a verification code
  const verificationCode = crypto.randomBytes(3).toString("hex").toUpperCase();
  const verificationCodeExpires = Date.now() + 10 * 60 * 1000; // Code valid for 10 minutes

  const newUser = new User({
    username,
    email,
    password,
    verificationCode,
    verificationCodeExpires,
  });

  await newUser.save();
  sendVerificationEmail(email, verificationCode);

  // Store the email in the session
  req.session.email = email;
  console.log(req.session);
  res.status(201).json({
    status: "success",
    message:
      "User created successfully! Please check your email to verify your account!",
  });
});

// export const verifyEmail = async (req, res, next) => {
//   const { token } = req.query;
//   try {
//     const user = await User.findOne({ verificationToken: token });

//     if (!user) {
//       return res.status(400).json("Invalid or expired token.");
//     }

//     // user.isVerified = true;
//     // user.verificationToken = undefined; // Clear the token after verification
//     await user.save();

//     res.status(200).json("Email created successfully!");
//     // res.redirect("https://mern-blog-pt2t.onrender.com/email-verified");
//   } catch (error) {
//     next(error);
//   }
// };

export const SignIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new APPError("please provide a valid email and password"));
  }
  const isUserExist = await User.findOne({ email }).select("+password");

  //   const checkPassword = await isUserExist.comparePassword(password);

  if (!isUserExist || !(await isUserExist.comparePassword(password))) {
    return res.status(400).send("Invalid credentials!");
  }

  // Check if the user is validated
  if (!isUserExist.isValidated) {
    // Generate a new verification code
    const verificationCode = crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase();
    const verificationCodeExpires = Date.now() + 10 * 60 * 1000; // Code valid for 10 minutes

    // Update user with new verification code
    isUserExist.verificationCode = verificationCode;
    isUserExist.verificationCodeExpires = verificationCodeExpires;
    await isUserExist.save();

    // Send verification code via email
    sendVerificationEmail(email, verificationCode);
    req.session.email = email;
    // console.log(req.session);
    return res.status(401).json({
      validate: false,
      status: "fail",
      message:
        "Your account is not yet validated. Another verification code has been sent to your email.",
    });
  }

  const expiresIn = 7 * 24 * 60 * 60;

  const token = jwt.sign({ _id: isUserExist._id }, jwtSecret, {
    expiresIn,
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    maxAge: expiresIn * 1000, // 7 days
  });

  isUserExist.password = undefined;

  res.status(200).json({
    status: "success",
    message: "logged in success!",
    user: isUserExist,
    expiresIn,
  });
});

export const verifyCode = catchAsync(async (req, res, next) => {
  const { code } = req.body;
  const email = req.session.email; // Get email from session
  console.log(email);
  if (!email) {
    return next(new APPError("Email is required", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new APPError("User not found", 404));
  }
  console.log(user);
  if (user.verificationCodeExpires < Date.now()) {
    return next(new APPError("Verification code has expired", 400));
  }
  console.log(user.verificationCodeExpires);

  if (user.verificationCode !== code) {
    return next(new APPError("Invalid verification code", 400));
  }
  console.log(user.verificationCode);

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  // Clear the email from the session
  req.session.email = null;

  res.status(200).json({
    status: "success",
    message: "Email verified successfully!",
  });
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).send("User not found");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes
  await user.save();

  try {
    await sendPasswordResetEmail(user, resetToken);
    res.status(200).json({
      status: "success",
      message: "please go to your email to reset your password",
    });
  } catch (err) {
    console.error("Error sending email: ", err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new APPError(
        "there is an error for sending email, please try again later",
        500
      )
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new APPError(400, "Password reset token is invalid or has expired")
    );
  }
  const { password, passwordConfirm } = req.body;
  if (password !== passwordConfirm) {
    return next(new APPError("Passwords do not match", 400));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "your password has been changes successfulyy",
  });
});

export const updatePassword = catchAsync(async (req, res, next) => {
  //1) get user from collection
  const user = await User.findById(req.user._id).select("+password");
  //2) check if POSTED current password is correct
  if (!(await user.comparePassword(req.body.passwordCurrent))) {
    return next(new APPError("your current passowrd is incorrect", 401));
  }
  //3) if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //4) log user in , send JWT
  const expiresIn = 7 * 24 * 60 * 60;
  const token = jwt.sign({ _id: user._id }, jwtSecret, {
    expiresIn,
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    maxAge: expiresIn * 1000, // 7 days
  });

  //   user.password = undefined;

  res.status(200).json({
    status: "success",
    message: "password successfully updated!",
    user,
    expiresIn,
  });
});

export const protect = catchAsync(async (req, res, next) => {
  const token = req.headers.cookie;
  // console.log(token);
  const splitToken = token.split("=")[1];
  if (!splitToken) return next(new APPError("Access denied please login", 403));

  //   console.log(splitToken);
  const decoded = jwt.verify(splitToken, jwtSecret);
  // console.log(decoded);

  //check if user still exist
  const currentUser = await User.findById(decoded._id);
  if (!currentUser) {
    return next(
      new APPError(`the user belonging this token does not exist`, 401)
    );
  }
  req.user = currentUser;

  next();
});
