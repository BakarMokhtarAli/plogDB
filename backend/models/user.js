import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";
const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      validator: [validator.isEmail, "email must be valid"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
      select: false,
    },
    // passwordConfirm: {
    //   type: String,
    //   required: [true, "password confrim is required"],
    //   validate: {
    //     validator: function (pass) {
    //       return pass === this.password;
    //     },
    //     message: "passwords are not same",
    //   },
    // },
    photo: {
      type: String,
      default: "default.jpg",
    },
    isVerified: { type: Boolean, default: false },
    verificationCode: String,
    verificationCodeExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // only runs if password was modified
  if (!this.isModified("password")) return next();

  // hash the password
  this.password = await bcrypt.hash(this.password, 12);

  // delete password confirm field
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createResetPasswordToken = function () {
  const resteToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resteToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log({ resteToken }, this.passwordResetToken);

  return resteToken;
};

userSchema.virtual("posts", {
  ref: "Post",
  foreignField: "author", // this is the name of the field in the other model. for now author in posts
  localField: "_id",
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

const User = mongoose.model("User", userSchema);
export default User;
