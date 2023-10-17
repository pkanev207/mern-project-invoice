import chalk from "chalk";
import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";

const app = express();
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
// that would stop us from sending nested objects
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.get("/api/v1/test", (req, res) => {
  res.json({ Hi: "Hello from the Invoice app!!!!" });
});

const PORT = process.env.PORT || 1997;

app.listen(PORT, () => {
  // console.log("Server is running!");
  console.log(
    `${chalk.green.bold("✔")} 👍 Server is running in ${chalk.yellow.bold(
      process.env.NODE_ENV
    )} mode on port ${chalk.blue.bold(PORT)}`
  );
});
