import express from "express";
import userRouter from "./routes/userRouter.js";
import postRouter from "./routes/postRouter.js";
import globalErrorHandler from "./controllers/errorController.js";
import APPError from "./utils/AppError.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import cors from "cors";

import { dbURL, SESSION_SECRET } from "./config/config.js";
const app = express();

app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(
  session({
    secret: SESSION_SECRET, // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: dbURL, // Replace with your MongoDB connection string
    }),
    cookie: { maxAge: 180 * 60 * 1000 }, // Session expiration time in milliseconds
  })
);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// import path from "path";

// const _dirname = path.resolve();

app.use(express.json());
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);

// under right routes important
// app.use(express.static(path.join(_dirname, "/frontend/dist")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(_dirname, "forntend", "dist", "index.html"));
// });
// "build": "npm install && npm install --prefix frontend && npm run build --prefix frontend"
// this must be under the right routes
app.use("*", (req, res, next) => {
  const message = `Can't find this ${req.originalUrl} url on this server!`;
  next(new APPError(message, 404));
});
app.use(globalErrorHandler);
export default app;
