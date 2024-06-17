import chalk from "chalk";
import app from "./app.js";
import connectDB from "./config/db.js";

app.listen(process.env.PORT, () => {
  console.log(`app runing on port ${chalk.yellow(process.env.PORT)}`);
});
