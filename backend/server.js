import "dotenv/config";
import chalk from "chalk";
import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
// import cors from "cors";
// since we are using ES modules - we have to add .js extension
import connectionToDB from "./config/connectDb.js";
import { morganMiddleware, systemLogs } from "./utils/Logger.js";
import mongoSanitize from "express-mongo-sanitize";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";

await connectionToDB();

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
// that would stop us from sending nested objects
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(cors());
// Object keys starting with $ or containing a period are reserved for use by
// MongoDB as operators. Without sanitization malicious users could send such objects,
// and change the context of the database operation
// Most notorious is the $where operator, which can execute arbitrary JavaScript on the database
app.use(mongoSanitize());
app.use(morganMiddleware);

app.get("/api/v1/test", (req, res) => {
  res.json({ Hi: "Hello from the Invoice app!!!!" });
});

app.use("/api/v1/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

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
