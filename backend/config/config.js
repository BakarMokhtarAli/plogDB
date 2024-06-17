import dotenv from "dotenv";

dotenv.config();

export const dbURL = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.PASSWORD
);

export const port = 3000;
export const jwtSecret = process.env.JWT_SECRET_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const SESSION_SECRET = process.env.SESSION_SECRET;
