import "dotenv/config";
import chalk from "chalk";
import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
// since we are using ES modules - we have to add .js extension
import { morganMiddleware, systemLogs } from "./utils/Logger.js";

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
// that would stop us from sending nested objects
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use(morganMiddleware);

app.get("/api/v1/test", (req, res) => {
  res.json({ Hi: "Hello from the Invoice app!!!!" });
});

const PORT = process.env.PORT || 1997;

app.listen(PORT, () => {
  console.log(
    `${chalk.green.bold("✔")} 👍 Server is running in ${chalk.yellow.bold(
      process.env.NODE_ENV
    )} mode on port ${chalk.blue.bold(PORT)}`
  );
  systemLogs.info(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});
