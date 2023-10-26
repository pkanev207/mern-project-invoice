import "dotenv/config";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { fileURLToPath } from "url";
// import transporter from "../helpers/emailTransport.js";
import nodemailer from "nodemailer";
// import mg from "nodemailer-mailgun-transport";
import { systemLogs } from "./Logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let transporter;

if (process.env.NODE_ENV === "development") {
  transporter = nodemailer.createTransport({
    host: "mailhog",
    port: 1025,
  });
} else if (process.env.NODE_ENV === "production") {
  // const mailgunAuth = {
  // 	auth: {
  // 		api_key: process.env.MAILGUN_API_KEY,
  // 		domain: process.env.MAILGUN_DOMAIN,
  // 	},
  // };
  // transporter = nodemailer.createTransport(mg(mailgunAuth));

  transporter = nodemailer.createTransport({
    // TODO: configure mailgun  in production
  });
}

const sendEmail = async (email, subject, payload, template) => {
  try {
    // in the current directory look for folder called templates
    const sourceDirectory = fs.readFileSync(
      path.join(__dirname, template),
      "utf-8"
    );
    // use handlebars to compile all the templates in this directory
    const compiledTemplate = handlebars.compile(sourceDirectory);
    const emailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: subject,
      html: compiledTemplate(payload),
    };

    await transporter.sendMail(emailOptions);
  } catch (err) {
    console.error(err);
    systemLogs.error(`email not send: ${err}`);
  }
};

export default sendEmail;

// (alias) fileURLToPath(url: string | URL): string (+1 overload)
// import fileURLToPath
// This function ensures the correct decodings of percent-encoded characters
// as well as ensuring a cross-platform valid absolute path string.

// import { fileURLToPath } from 'node:url';

// const __filename = fileURLToPath(import.meta.url);

// new URL('file:///C:/path/').pathname;      // Incorrect: /C:/path/
// fileURLToPath('file:///C:/path/');         // Correct:   C:\path\ (Windows)

// new URL('file://nas/foo.txt').pathname;    // Incorrect: /foo.txt
// fileURLToPath('file://nas/foo.txt');       // Correct:   \\nas\foo.txt (Windows)

// new URL('file:///你好.txt').pathname;      // Incorrect: /%E4%BD%A0%E5%A5%BD.txt
// fileURLToPath('file:///你好.txt');         // Correct:   /你好.txt (POSIX)

// new URL('file:///hello world').pathname;   // Incorrect: /hello%20world
// fileURLToPath('file:///hello world');      // Correct:   /hello world (POSIX)
// @since — v10.12.0

// @param url — The file URL string or URL object to convert to a path.

// @return — The fully-resolved platform-specific Node.js file path
