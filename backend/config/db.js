import mongoose from "mongoose";
import chalk from "chalk";

import { dbURL } from "./config.js";

const connectDB = mongoose
  .connect(dbURL)
  .then(() => {
    console.log(chalk.green("Database connection success!"));
  })
  .catch((err) => {
    console.log(`error connection DB ${err}`);
  });

export default connectDB;
